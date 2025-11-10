#!/bin/bash

# Innovation Platform - Bicep Deployment Script
# Uses Azure Bicep templates for infrastructure as code

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
RESOURCE_GROUP="innovation-platform-rg"
LOCATION="eastus2"
DEPLOYMENT_NAME="innovation-platform-$(date +%Y%m%d-%H%M%S)"
TEMPLATE_FILE="main.bicep"
PARAMETERS_FILE="main.parameters.json"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_region_availability() {
    log_info "Checking region availability for $LOCATION..."

    # Test if we can create a resource group in the specified region
    if az group create --name "test-region-$LOCATION" --location "$LOCATION" --output none 2>/dev/null; then
        # Clean up the test resource group
        az group delete --name "test-region-$LOCATION" --yes --output none 2>/dev/null || true
        log_success "Region $LOCATION is available"
        return 0
    else
        log_warning "Region $LOCATION is not available. Trying alternative regions..."

        # Try alternative regions that are commonly available
        local alternative_regions=("eastus" "westus2" "northeurope" "westeurope" "southeastasia" "australiaeast")

        for region in "${alternative_regions[@]}"; do
            log_info "Testing region: $region"
            if az group create --name "test-region-$region" --location "$region" --output none 2>/dev/null; then
                az group delete --name "test-region-$region" --yes --output none 2>/dev/null || true
                LOCATION="$region"
                log_success "Using alternative region: $LOCATION"
                return 0
            fi
        done

        # If no automatic region works, ask user to choose
        log_error "Could not find an available region automatically."
        echo ""
        echo "Available regions for your subscription:"
        az account list-locations --query "[].{Name:name, DisplayName:displayName}" -o table | head -10

        echo ""
        read -p "Please enter a region name (e.g., eastus, westus2): " user_region

        if [ -n "$user_region" ]; then
            log_info "Testing user-selected region: $user_region"
            if az group create --name "test-region-$user_region" --location "$user_region" --output none 2>/dev/null; then
                az group delete --name "test-region-$user_region" --yes --output none 2>/dev/null || true
                LOCATION="$user_region"
                log_success "Using user-selected region: $LOCATION"
                return 0
            else
                log_error "User-selected region $user_region is also not available."
            fi
        fi

        log_error "Could not find an available region. Please check your Azure subscription restrictions or contact support."
        exit 1
    fi
}

check_prerequisites() {
    log_info "Checking prerequisites..."

    if ! command -v az &> /dev/null; then
        log_error "Azure CLI is not installed. Please install it first."
        exit 1
    fi

    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install it first."
        exit 1
    fi

    if ! az account show &> /dev/null; then
        log_error "Not logged in to Azure. Please run 'az login --use-device-code' first."
        exit 1
    fi

    # Check if Bicep is available
    if ! az bicep version &> /dev/null; then
        log_warning "Bicep CLI not detected. Installing..."
        az bicep install
        log_success "Bicep CLI installed"
    fi

    # Check Docker daemon
    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running. Please start Docker first."
        exit 1
    fi

    # Verify subscription
    SUBSCRIPTION_NAME=$(az account show --query "name" -o tsv)
    SUBSCRIPTION_ID=$(az account show --query "id" -o tsv)
    log_info "Using Azure subscription: $SUBSCRIPTION_NAME ($SUBSCRIPTION_ID)"

    # Check if files exist
    if [ ! -f "$TEMPLATE_FILE" ]; then
        log_error "Bicep template file $TEMPLATE_FILE not found"
        exit 1
    fi

    if [ ! -f "$PARAMETERS_FILE" ]; then
        log_error "Parameters file $PARAMETERS_FILE not found"
        exit 1
    fi

    log_success "Prerequisites check passed"
}

diagnostic_check() {
    log_info "Running diagnostic checks..."

    # Check for existing failed deployments
    FAILED_DEPLOYMENTS=$(az deployment group list --resource-group $RESOURCE_GROUP --query "[?properties.provisioningState=='Failed'].name" -o tsv 2>/dev/null | wc -l)
    if [ "$FAILED_DEPLOYMENTS" -gt 0 ]; then
        log_warning "Found $FAILED_DEPLOYMENTS failed deployments in resource group"
        log_info "Consider cleaning up failed resources with: az group delete --name $RESOURCE_GROUP --yes"
    fi

    # Check existing resources
    ACR_EXISTS=$(az acr show --name innovationplatformacr --resource-group $RESOURCE_GROUP --query "name" -o tsv 2>/dev/null || echo "")
    if [ -n "$ACR_EXISTS" ]; then
        log_info "ACR already exists: $ACR_EXISTS"
    else
        log_info "ACR will be created during deployment"
    fi

    SWA_EXISTS=$(az staticwebapp show --name innovation-platform-frontend --resource-group $RESOURCE_GROUP --query "name" -o tsv 2>/dev/null || echo "")
    if [ -n "$SWA_EXISTS" ]; then
        log_info "Static Web App already exists: $SWA_EXISTS"
    else
        log_info "Static Web App will be created during deployment"
    fi

    log_success "Diagnostic checks completed"
}

cleanup_failed_deployment() {
    log_warning "Cleaning up potential failed deployment artifacts..."

    # Remove dangling Docker images
    log_info "Cleaning up Docker images..."
    docker system prune -f >/dev/null 2>&1

    # Remove local images that might be corrupted
    services=("gateway" "auth-service" "events-service" "projects-service" "participants-service" "notifications-service")
    for service in "${services[@]}"; do
        if docker images | grep -q "^$service "; then
            log_info "Removing existing $service image..."
            docker rmi $service:latest >/dev/null 2>&1 || true
        fi
    done

    log_success "Cleanup completed"
}

create_resource_group() {
    log_info "Creating resource group: $RESOURCE_GROUP in $LOCATION"

    if az group show --name $RESOURCE_GROUP &> /dev/null; then
        log_warning "Resource group $RESOURCE_GROUP already exists, skipping creation"
    else
        az group create \
            --name $RESOURCE_GROUP \
            --location $LOCATION \
            --tags Environment=Production Project=InnovationPlatform \
            --output none
        log_success "Resource group created"
    fi
}

generate_jwt_secret() {
    if [ -z "$JWT_SECRET" ]; then
        JWT_SECRET=$(openssl rand -hex 32)
        log_info "Generated JWT_SECRET: $JWT_SECRET"
        log_warning "Save this JWT_SECRET for your GitHub secrets!"
    fi
}

update_parameters_file() {
    log_info "Updating parameters file with JWT secret..."

    # Update the parameters file with the generated JWT secret
    sed -i.bak "s/\"REPLACE_WITH_YOUR_JWT_SECRET\"/\"$JWT_SECRET\"/" $PARAMETERS_FILE
    log_success "Parameters file updated"
}

build_images() {
    log_info "Building and preparing Docker images..."

    # Services to build
    services=("gateway" "auth-service" "events-service" "projects-service" "participants-service" "notifications-service")

    for service in "${services[@]}"; do
        log_info "Building $service image..."

        # Remove existing image if it exists to avoid conflicts
        if docker images | grep -q "^$service "; then
            log_info "Removing existing $service image..."
            docker rmi $service:latest || true
        fi

        # Build from backend directory with full context so shared folder is available
        docker build -t $service:latest -f backend/$service/Dockerfile backend

        if [ $? -eq 0 ]; then
            log_success "$service image built successfully"
        else
            log_error "Failed to build $service image"
            exit 1
        fi
    done

    log_success "All Docker images built"
}

push_images_to_acr() {
    log_info "Pushing images to Azure Container Registry..."

    # Get ACR login server and credentials
    ACR_NAME="innovationplatformacr"
    ACR_LOGIN_SERVER="$ACR_NAME.azurecr.io"

    # Get ACR admin credentials
    ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query "username" -o tsv 2>/dev/null)
    ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query "passwords[0].value" -o tsv 2>/dev/null)

    if [ -z "$ACR_USERNAME" ] || [ -z "$ACR_PASSWORD" ]; then
        log_error "Failed to get ACR credentials for $ACR_NAME"
        log_error "Make sure the ACR was created successfully in the Bicep deployment"
        exit 1
    fi

    log_info "ACR credentials obtained successfully"

    # Login to ACR
    log_info "Logging into Azure Container Registry..."
    echo $ACR_PASSWORD | docker login $ACR_LOGIN_SERVER -u $ACR_USERNAME --password-stdin

    if [ $? -ne 0 ]; then
        log_error "Failed to login to ACR $ACR_LOGIN_SERVER"
        log_error "Check if ACR exists and credentials are valid"
        exit 1
    fi
    log_success "Successfully logged into ACR"

    # Services to push
    services=("gateway" "auth-service" "events-service" "projects-service" "participants-service" "notifications-service")

    for service in "${services[@]}"; do
        log_info "Pushing $service image to ACR..."

        # Verify local image exists
        if ! docker images | grep -q "^$service "; then
            log_error "Local image $service:latest not found"
            exit 1
        fi

        # Tag the image for ACR
        docker tag $service:latest $ACR_LOGIN_SERVER/$service:latest

        if [ $? -ne 0 ]; then
            log_error "Failed to tag $service image for ACR"
            exit 1
        fi

        # Push the image
        docker push $ACR_LOGIN_SERVER/$service:latest

        if [ $? -eq 0 ]; then
            log_success "$service image pushed to ACR successfully"
        else
            log_error "Failed to push $service image to ACR"
            log_error "Check ACR connectivity and permissions"
            exit 1
        fi
    done

    log_success "All images pushed to Azure Container Registry"
}


cleanup_failed_resources() {
    log_info "Cleaning up failed resources from previous deployments..."

    # List of services to check
    services=("gateway" "auth-service" "events-service" "projects-service" "participants-service" "notifications-service")

    # For Incremental deployment, we don't need to delete existing resources
    # Just check their state and continue
    for service in "${services[@]}"; do
        log_info "Checking container app: $service"
        state=$(az containerapp show --name "$service" --resource-group "$RESOURCE_GROUP" --query "properties.provisioningState" -o tsv 2>/dev/null || echo "NotFound")

        if [ "$state" = "Failed" ]; then
            log_warning "Container app $service is in Failed state - will be recreated by Bicep"
        elif [ "$state" = "Succeeded" ]; then
            log_info "Container app $service is healthy (Succeeded) - will be updated by Bicep"
        elif [ "$state" != "NotFound" ]; then
            log_warning "Container app $service is in $state state - will be updated by Bicep"
        else
            log_info "Container app $service not found - will be created by Bicep"
        fi
    done

    # ACR and Environment should be fine, let Bicep handle them
    log_success "Cleanup completed - proceeding with incremental deployment"
}

deploy_complete_infrastructure() {
    log_info "Deploying complete infrastructure with ACR images..."

    # Validate Bicep template before deployment
    log_info "Validating Bicep template..."
    az deployment group validate \
        --resource-group $RESOURCE_GROUP \
        --template-file $TEMPLATE_FILE \
        --parameters $PARAMETERS_FILE \
        --output none

    if [ $? -ne 0 ]; then
        log_error "Bicep template validation failed"
        exit 1
    fi
    log_success "Bicep template validation passed"

    # Force complete redeployment to ensure all configurations are updated
    log_info "Starting complete infrastructure deployment (forcing config updates)..."
    az deployment group create \
        --resource-group $RESOURCE_GROUP \
        --template-file $TEMPLATE_FILE \
        --parameters $PARAMETERS_FILE \
        --name $DEPLOYMENT_NAME \
        --mode Complete \
        --output json \
        --query "{provisioningState:properties.provisioningState, outputs:properties.outputs}"

    if [ $? -eq 0 ]; then
        log_success "Complete infrastructure deployment successful"
    else
        log_error "Complete infrastructure deployment failed"
        exit 1
    fi
}

deploy_bicep_complete() {
    log_info "Deploying complete infrastructure with Bicep..."

    # Validate Bicep template before deployment
    log_info "Validating Bicep template..."
    az deployment group validate \
        --resource-group $RESOURCE_GROUP \
        --template-file $TEMPLATE_FILE \
        --parameters $PARAMETERS_FILE \
        --output none

    if [ $? -ne 0 ]; then
        log_error "Bicep template validation failed"
        exit 1
    fi
    log_success "Bicep template validation passed"

    # Deploy infrastructure
    log_info "Starting infrastructure deployment..."
    az deployment group create \
        --resource-group $RESOURCE_GROUP \
        --template-file $TEMPLATE_FILE \
        --parameters $PARAMETERS_FILE \
        --name $DEPLOYMENT_NAME \
        --output json \
        --query "{provisioningState:properties.provisioningState, outputs:properties.outputs}"

    if [ $? -eq 0 ]; then
        log_success "Bicep deployment completed successfully"
        return 0
    else
        log_error "Bicep deployment failed - attempting recovery..."

        # Check if ACR was created
        verify_acr_exists
        if [ $? -eq 0 ]; then
            log_info "ACR exists, pushing images and retrying deployment..."

            # Push images to ACR
            push_images_to_acr

            if [ $? -eq 0 ]; then
                log_info "Images pushed successfully, retrying deployment..."

                # Try deployment again
                az deployment group create \
                    --resource-group $RESOURCE_GROUP \
                    --template-file $TEMPLATE_FILE \
                    --parameters $PARAMETERS_FILE \
                    --name "${DEPLOYMENT_NAME}-retry" \
                    --output json \
                    --query "{provisioningState:properties.provisioningState, outputs:properties.outputs}"

                if [ $? -eq 0 ]; then
                    log_success "Retry deployment successful"
                    return 0
                else
                    log_error "Retry deployment failed"
                    exit 1
                fi
            else
                log_error "Failed to push images to ACR"
                exit 1
            fi
        else
            log_error "ACR was not created successfully, cannot recover"
            exit 1
        fi
    fi
}

update_container_apps() {
    log_info "Updating container apps to use ACR images..."

    ACR_NAME="innovationplatformacr"
    ACR_LOGIN_SERVER="$ACR_NAME.azurecr.io"

    # List of services to update
    services=("gateway" "auth-service" "events-service" "projects-service" "participants-service" "notifications-service")

    for service in "${services[@]}"; do
        # Container app names match service names exactly
        container_app_name="$service"

        log_info "Updating $container_app_name to use ACR image..."

        # Update the container app to use the ACR image
        az containerapp update \
            --name "$container_app_name" \
            --resource-group "$RESOURCE_GROUP" \
            --image "$ACR_LOGIN_SERVER/$service:latest" \
            --registry-server "$ACR_LOGIN_SERVER" \
            --output none

        if [ $? -eq 0 ]; then
            log_success "$container_app_name updated successfully"
        else
            log_error "Failed to update $container_app_name"
            exit 1
        fi
    done

    log_success "All container apps updated to use ACR images"
}

verify_acr_exists() {
    log_info "Verifying Azure Container Registry exists..."

    ACR_NAME="innovationplatformacr"
    ACR_LOGIN_SERVER="$ACR_NAME.azurecr.io"

    # Check if ACR exists and is accessible
    if ! az acr show --name $ACR_NAME --resource-group $RESOURCE_GROUP --output none 2>/dev/null; then
        log_error "ACR $ACR_NAME does not exist in resource group $RESOURCE_GROUP"
        exit 1
    fi

    # Test ACR connectivity
    ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query "username" -o tsv 2>/dev/null)
    ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query "passwords[0].value" -o tsv 2>/dev/null)

    if [ -z "$ACR_USERNAME" ] || [ -z "$ACR_PASSWORD" ]; then
        log_error "Failed to get ACR credentials"
        exit 1
    fi

    log_success "ACR $ACR_NAME is accessible and ready"
}

verify_static_web_app_config() {
    log_info "Verifying Static Web App configuration..."

    SWA_NAME="innovation-platform-frontend"

    # Check if Static Web App exists
    if ! az staticwebapp show --name $SWA_NAME --resource-group $RESOURCE_GROUP --output none 2>/dev/null; then
        log_error "Static Web App $SWA_NAME does not exist"
        exit 1
    fi

    # Check repository URL configuration
    REPO_URL=$(az staticwebapp show --name $SWA_NAME --resource-group $RESOURCE_GROUP --query "repositoryUrl" -o tsv 2>/dev/null)

    if [ -z "$REPO_URL" ] || [ "$REPO_URL" = "null" ]; then
        log_warning "Static Web App repository URL is not configured"
        log_info "You may need to configure the GitHub repository URL manually"
    else
        log_success "Static Web App repository URL: $REPO_URL"
    fi
}

get_deployment_outputs() {
    log_info "Getting deployment outputs..."

    # Verify infrastructure components exist
    verify_acr_exists
    verify_static_web_app_config

    # Get outputs from the complete deployment
    outputs=$(az deployment group show \
        --resource-group $RESOURCE_GROUP \
        --name "$DEPLOYMENT_NAME" \
        --query "properties.outputs" 2>/dev/null || echo "{}")

    # Extract URLs from deployment outputs
    FRONTEND_URL=$(az staticwebapp show \
        --name innovation-platform-frontend \
        --resource-group $RESOURCE_GROUP \
        --query "defaultHostname" -o tsv 2>/dev/null || echo "NotAvailable")

    GATEWAY_URL=$(az deployment group show \
        --resource-group $RESOURCE_GROUP \
        --name "$DEPLOYMENT_NAME" \
        --query "properties.outputs.gatewayUrl.value" -o tsv 2>/dev/null || echo "NotAvailable")

    # If gateway URL is not available from deployment outputs, try to get it directly
    if [ "$GATEWAY_URL" = "NotAvailable" ]; then
        GATEWAY_URL=$(az containerapp show \
            --name gateway \
            --resource-group $RESOURCE_GROUP \
            --query "properties.configuration.ingress.fqdn" -o tsv 2>/dev/null || echo "NotAvailable")
    fi

    # Get publish profile for Static Web App
    PUBLISH_PROFILE=$(az staticwebapp secrets list \
        --name innovation-platform-frontend \
        --resource-group $RESOURCE_GROUP \
        --query "properties.apiKey" -o tsv 2>/dev/null || echo "NotAvailable")

    log_info "URLs extracted: Frontend=$FRONTEND_URL, Gateway=$GATEWAY_URL"
}

diagnose_container_apps() {
    log_info "🔍 Diagnosing Container Apps configuration..."

    services=("gateway" "auth-service" "events-service" "projects-service" "participants-service" "notifications-service")

    for service in "${services[@]}"; do
        log_info "Checking $service..."
        if az containerapp show --name "$service" --resource-group "$RESOURCE_GROUP" --output none 2>/dev/null; then
            # Get container app details
            status=$(az containerapp show --name "$service" --resource-group "$RESOURCE_GROUP" --query "properties.provisioningState" -o tsv 2>/dev/null || echo "Unknown")
            log_info "  Status: $status"

            # Check if it has ingress
            ingress_fqdn=$(az containerapp show --name "$service" --resource-group "$RESOURCE_GROUP" --query "properties.configuration.ingress.fqdn" -o tsv 2>/dev/null || echo "No ingress")
            log_info "  Ingress FQDN: $ingress_fqdn"

            # Check environment variables for gateway
            if [ "$service" = "gateway" ]; then
                log_info "  Checking gateway environment variables..."
                env_vars=$(az containerapp show --name "$service" --resource-group "$RESOURCE_GROUP" --query "properties.template.containers[0].env" -o json 2>/dev/null || echo "[]")

                if [ "$env_vars" = "[]" ]; then
                    log_error "  ❌ No environment variables found for gateway!"
                else
                    echo "  Gateway env vars:"
                    # Try to parse with jq, fallback to raw output
                    if command -v jq >/dev/null 2>&1; then
                        echo "$env_vars" | jq -r '.[] | "    \(.name): \(.value)"' 2>/dev/null || echo "    Raw env vars: $env_vars"
                    else
                        echo "    Raw env vars: $env_vars"
                    fi

                    # Check if service URLs are present
                    auth_url=$(echo "$env_vars" | jq -r '.[] | select(.name == "AUTH_SERVICE_URL") | .value' 2>/dev/null | tr -d '\n' || echo "")
                    events_url=$(echo "$env_vars" | jq -r '.[] | select(.name == "EVENTS_SERVICE_URL") | .value' 2>/dev/null | tr -d '\n' || echo "")

                    # Also check JWT_SECRET
                    jwt_secret=$(echo "$env_vars" | jq -r '.[] | select(.name == "JWT_SECRET") | .value' 2>/dev/null | tr -d '\n' || echo "")

                    if [ -n "$jwt_secret" ] && [ "$jwt_secret" != "null" ] && [ ${#jwt_secret} -gt 10 ]; then
                        log_info "  ✅ JWT_SECRET: ${jwt_secret:0:10}..."
                    else
                        log_warning "  ⚠️  JWT_SECRET not found or invalid in gateway environment variables!"
                    fi

                    if [ -n "$auth_url" ] && [ "$auth_url" != "null" ] && [[ "$auth_url" == http* ]]; then
                        log_info "  ✅ AUTH_SERVICE_URL: $auth_url"
                    else
                        log_warning "  ⚠️  AUTH_SERVICE_URL not found or invalid in gateway environment variables!"
                    fi

                    if [ -n "$events_url" ] && [ "$events_url" != "null" ] && [[ "$events_url" == http* ]]; then
                        log_info "  ✅ EVENTS_SERVICE_URL: $events_url"
                    else
                        log_warning "  ⚠️  EVENTS_SERVICE_URL not found or invalid in gateway environment variables!"
                    fi
                fi
            fi
        else
            log_error "  Container app '$service' does NOT exist!"
        fi
        echo ""
    done
}

test_internal_connectivity() {
    log_info "🔗 Testing internal connectivity between container apps..."

    # Get gateway URL
    GATEWAY_URL=$(az containerapp show --name gateway --resource-group "$RESOURCE_GROUP" --query "properties.configuration.ingress.fqdn" -o tsv 2>/dev/null || echo "")

    if [ -z "$GATEWAY_URL" ]; then
        log_error "Could not get gateway URL"
        return 1
    fi

    log_info "Gateway external URL: https://$GATEWAY_URL"

    # Test direct connectivity to auth service (external HTTPS)
    AUTH_URL=$(az containerapp show --name auth-service --resource-group "$RESOURCE_GROUP" --query "properties.configuration.ingress.fqdn" -o tsv 2>/dev/null || echo "")

    if [ -n "$AUTH_URL" ]; then
        log_info "Testing direct external access to auth service: https://$AUTH_URL/api/auth/validate"
        curl -s -k --connect-timeout 10 --max-time 30 -w "Status: %{http_code}\\n" "https://$AUTH_URL/api/auth/validate" -X POST -H "Content-Type: application/json" -d '{"token":"test"}' | head -3
    fi

    # Test direct connectivity to events service (external HTTPS)
    EVENTS_URL=$(az containerapp show --name events-service --resource-group "$RESOURCE_GROUP" --query "properties.configuration.ingress.fqdn" -o tsv 2>/dev/null || echo "")

    if [ -n "$EVENTS_URL" ]; then
        log_info "Testing direct external access to events service: https://$EVENTS_URL/api/events/available"
        curl -s -k --connect-timeout 10 --max-time 30 -w "Status: %{http_code}\\n" "https://$EVENTS_URL/api/events/available" | head -3
    fi

    # Test through gateway
    log_info "Testing through gateway: https://$GATEWAY_URL/api/auth/validate"
    curl -s -k --connect-timeout 10 --max-time 30 -w "Status: %{http_code}\\n" "https://$GATEWAY_URL/api/auth/validate" -X POST -H "Content-Type: application/json" -d '{"token":"test"}' | head -3

    # Test gateway to events
    log_info "Testing through gateway: https://$GATEWAY_URL/api/events/available"
    curl -s -k --connect-timeout 10 --max-time 30 -w "Status: %{http_code}\\n" "https://$GATEWAY_URL/api/events/available" | head -3

    # Test internal connectivity simulation
    log_info "Testing internal connectivity simulation..."
    if [ -n "$AUTH_URL" ]; then
        log_info "Simulating gateway internal call to: http://$AUTH_URL/api/auth/validate"
        # Try HTTP instead of HTTPS for internal communication
        curl -s --connect-timeout 5 --max-time 15 -w "Status: %{http_code}\\n" "http://$AUTH_URL/api/auth/validate" -X POST -H "Content-Type: application/json" -d '{"token":"test"}' 2>/dev/null || echo "HTTP internal call failed"
    fi
}

test_gateway_after_env_update() {
    log_info "🧪 Testing gateway functionality after environment variable update..."

    # Get gateway URL
    GATEWAY_URL=$(az containerapp show --name gateway --resource-group "$RESOURCE_GROUP" --query "properties.configuration.ingress.fqdn" -o tsv 2>/dev/null || echo "")

    if [ -z "$GATEWAY_URL" ]; then
        log_error "Could not get gateway URL"
        return 1
    fi

    GATEWAY_HTTPS_URL="https://$GATEWAY_URL"
    log_info "Testing gateway at: $GATEWAY_HTTPS_URL"

    # Test 1: Root endpoint
    echo "1. Root endpoint:"
    curl -s -k --connect-timeout 5 --max-time 15 -w "Status: %{http_code}\\n" "$GATEWAY_HTTPS_URL/" | head -3
    echo ""

    # Test 2: Docs endpoint
    echo "2. Docs endpoint:"
    curl -s -k --connect-timeout 5 --max-time 15 -w "Status: %{http_code}\\n" "$GATEWAY_HTTPS_URL/docs" | head -3
    echo ""

    # Test 3: Auth service via gateway
    echo "3. Auth service via gateway (/api/auth/validate):"
    curl -s -k --connect-timeout 10 --max-time 30 -w "Status: %{http_code}\\n" "$GATEWAY_HTTPS_URL/api/auth/validate" -X POST -H "Content-Type: application/json" -d '{"token":"test"}' | head -3
    echo ""

    # Test 4: Events service via gateway
    echo "4. Events service via gateway (/api/events/available):"
    curl -s -k --connect-timeout 10 --max-time 30 -w "Status: %{http_code}\\n" "$GATEWAY_HTTPS_URL/api/events/available" | head -3
    echo ""

    # Test 5: Check if gateway has environment variables
    echo "5. Gateway environment variables check:"
    env_vars=$(az containerapp show --name gateway --resource-group "$RESOURCE_GROUP" --query "properties.template.containers[0].env" -o json 2>/dev/null || echo "[]")
    auth_url_present=$(echo "$env_vars" | jq -r '.[] | select(.name == "AUTH_SERVICE_URL") | .value' 2>/dev/null || echo "")
    if [ -n "$auth_url_present" ] && [ "$auth_url_present" != "null" ]; then
        log_info "  ✅ AUTH_SERVICE_URL is set to: $auth_url_present"
    else
        log_error "  ❌ AUTH_SERVICE_URL is NOT set!"
    fi

    # Test 6: Try to test internal connectivity if gateway has URLs
    if [ -n "$auth_url_present" ] && [ "$auth_url_present" != "null" ]; then
        echo ""
        echo "6. Testing internal connectivity from gateway perspective:"
        echo "   Gateway should connect to: $auth_url_present"

        # Try to access the auth service directly from our test (simulating what gateway does)
        # Convert http://hostname to https://hostname for external testing
        auth_external_url=$(echo "$auth_url_present" | sed 's/http:/https:/')
        echo "   Testing external equivalent: $auth_external_url/api/auth/validate"
        curl -s -k --connect-timeout 10 --max-time 30 -w "Status: %{http_code}\\n" "$auth_external_url/api/auth/validate" -X POST -H "Content-Type: application/json" -d '{"token":"test"}' | head -3
    fi
}

force_update_all_services_env_vars() {
    log_info "🔧 Forcing environment variable update for ALL services..."

    # Read the correct JWT from parameters file
    JWT_SECRET=$(grep '"value"' main.parameters.json | head -1 | sed 's/.*"value": "\([^"]*\)".*/\1/')

    log_info "Using JWT_SECRET from parameters file: $JWT_SECRET"

    # List of all services that need JWT_SECRET
    services=("gateway" "auth-service" "events-service" "projects-service" "participants-service" "notifications-service")

    for service in "${services[@]}"; do
        log_info "Updating $service with correct JWT_SECRET..."

        # Update JWT_SECRET for each service
        az containerapp update \
            --name "$service" \
            --resource-group "$RESOURCE_GROUP" \
            --set-env-vars "JWT_SECRET=$JWT_SECRET" \
            --output none 2>&1

        if [ $? -eq 0 ]; then
            log_success "$service JWT_SECRET updated successfully"
        else
            log_error "Failed to update $service JWT_SECRET"
        fi
    done

    # Now update gateway with service URLs
    force_update_gateway_env_vars
}

force_update_gateway_env_vars() {
    log_info "🔧 Forcing gateway environment variable update and rebuild..."

    # Get service FQDNs for internal communication between container apps
    AUTH_URL=$(az containerapp show --name auth-service --resource-group "$RESOURCE_GROUP" --query "properties.configuration.ingress.fqdn" -o tsv 2>/dev/null || echo "auth-service.mangorock-348e27b8.eastus2.azurecontainerapps.io")
    EVENTS_URL=$(az containerapp show --name events-service --resource-group "$RESOURCE_GROUP" --query "properties.configuration.ingress.fqdn" -o tsv 2>/dev/null || echo "events-service.mangorock-348e27b8.eastus2.azurecontainerapps.io")
    PROJECTS_URL=$(az containerapp show --name projects-service --resource-group "$RESOURCE_GROUP" --query "properties.configuration.ingress.fqdn" -o tsv 2>/dev/null || echo "projects-service.mangorock-348e27b8.eastus2.azurecontainerapps.io")
    PARTICIPANTS_URL=$(az containerapp show --name participants-service --resource-group "$RESOURCE_GROUP" --query "properties.configuration.ingress.fqdn" -o tsv 2>/dev/null || echo "participants-service.mangorock-348e27b8.eastus2.azurecontainerapps.io")
    NOTIFICATIONS_URL=$(az containerapp show --name notifications-service --resource-group "$RESOURCE_GROUP" --query "properties.configuration.ingress.fqdn" -o tsv 2>/dev/null || echo "notifications-service.mangorock-348e27b8.eastus2.azurecontainerapps.io")

    log_info "Using FQDN for internal container app communication (HTTP):"
    log_info "  AUTH: http://$AUTH_URL"
    log_info "  EVENTS: http://$EVENTS_URL"
    log_info "  PROJECTS: http://$PROJECTS_URL"
    log_info "  PARTICIPANTS: http://$PARTICIPANTS_URL"
    log_info "  NOTIFICATIONS: http://$NOTIFICATIONS_URL"

    # First, rebuild and push the gateway image with the fixes
    log_info "Rebuilding gateway image with ALLOW_ORIGINS fix..."
    docker rmi gateway:latest 2>/dev/null || true
    docker build -t gateway:latest -f backend/gateway/Dockerfile backend
    if [ $? -ne 0 ]; then
        log_error "Failed to rebuild gateway image"
        return 1
    fi
    log_success "Gateway image rebuilt successfully"

    # Push to ACR
    ACR_NAME=$(az acr list --resource-group "$RESOURCE_GROUP" --query "[0].name" -o tsv 2>/dev/null)
    if [ -n "$ACR_NAME" ]; then
        log_info "Pushing gateway image to ACR..."
        docker tag gateway:latest "${ACR_NAME}.azurecr.io/gateway:latest"
        az acr login --name "$ACR_NAME"
        docker push "${ACR_NAME}.azurecr.io/gateway:latest"
        if [ $? -eq 0 ]; then
            log_success "Gateway image pushed to ACR successfully"
        else
            log_error "Failed to push gateway image to ACR"
            return 1
        fi
    else
        log_error "Could not find ACR"
        return 1
    fi

    # Check current environment variables before update
    log_info "Checking current gateway environment variables..."
    current_env=$(az containerapp show --name gateway --resource-group "$RESOURCE_GROUP" --query "properties.template.containers[0].env" -o json 2>/dev/null || echo "[]")
    log_info "Current env vars: $current_env"

    # Try to update environment variables with replace-env-vars instead of set-env-vars
    log_info "Attempting to update gateway environment variables..."

    # Read the correct JWT from parameters file
    JWT_SECRET=$(grep '"value"' main.parameters.json | head -1 | sed 's/.*"value": "\([^"]*\)".*/\1/')

    log_info "Using JWT_SECRET from parameters file: $JWT_SECRET"

    # Try different approaches to update environment variables

    # Use FQDN for internal communication between container apps
    log_info "Attempting update with FQDN service URLs..."
    az containerapp update \
        --name gateway \
        --resource-group "$RESOURCE_GROUP" \
        --set-env-vars "JWT_SECRET=$JWT_SECRET" \
                       "AUTH_SERVICE_URL=http://$AUTH_URL" \
                       "EVENTS_SERVICE_URL=http://$EVENTS_URL" \
                       "PROJECTS_SERVICE_URL=http://$PROJECTS_URL" \
                       "PARTICIPANTS_SERVICE_URL=http://$PARTICIPANTS_URL" \
                       "NOTIFICATIONS_SERVICE_URL=http://$NOTIFICATIONS_URL" \
        --output json \
        --query "properties.provisioningState" 2>&1

    update_result=$?

    if [ $update_result -ne 0 ]; then
        log_warning "First approach failed, trying alternative approach..."

        # Second approach: using --replace-env-vars
        log_info "Attempting update with --replace-env-vars..."
        az containerapp update \
            --name gateway \
            --resource-group "$RESOURCE_GROUP" \
            --replace-env-vars "JWT_SECRET=$JWT_SECRET" \
                              "AUTH_SERVICE_URL=http://$AUTH_URL" \
                              "EVENTS_SERVICE_URL=http://$EVENTS_URL" \
                              "PROJECTS_SERVICE_URL=http://$PROJECTS_URL" \
                              "PARTICIPANTS_SERVICE_URL=http://$PARTICIPANTS_URL" \
                              "NOTIFICATIONS_SERVICE_URL=http://$NOTIFICATIONS_URL" \
            --output json \
            --query "properties.provisioningState" 2>&1

        update_result=$?
    fi

    if [ $update_result -ne 0 ]; then
        log_warning "Standard approaches failed, trying YAML configuration..."

        # Third approach: Create a YAML patch file
        cat > /tmp/gateway_patch.yaml << EOF
properties:
  template:
    containers:
    - name: gateway
      env:
      - name: JWT_SECRET
        value: "$JWT_SECRET"
      - name: LOG_LEVEL
        value: "INFO"
      - name: AUTH_SERVICE_URL
        value: "http://$AUTH_URL"
      - name: EVENTS_SERVICE_URL
        value: "http://$EVENTS_URL"
      - name: PROJECTS_SERVICE_URL
        value: "http://$PROJECTS_URL"
      - name: PARTICIPANTS_SERVICE_URL
        value: "http://$PARTICIPANTS_URL"
      - name: NOTIFICATIONS_SERVICE_URL
        value: "http://$NOTIFICATIONS_URL"
      - name: ALLOW_ORIGINS
        value: "https://lemon-glacier-06f5f6f0f.3.azurestaticapps.net"
EOF

        log_info "Attempting update with YAML patch..."
        az containerapp update \
            --name gateway \
            --resource-group "$RESOURCE_GROUP" \
            --yaml /tmp/gateway_patch.yaml \
            --output json \
            --query "properties.provisioningState" 2>&1

        update_result=$?
        rm -f /tmp/gateway_patch.yaml
    fi

    update_result=$?

    if [ $update_result -eq 0 ]; then
        log_success "Gateway environment variables update command executed"

        # Wait for update to complete
        log_info "Waiting for gateway update to complete..."
        sleep 15

        # Force restart to ensure environment variables are applied
        log_info "Restarting gateway container app..."

        # Try the correct restart command
        az containerapp revision restart \
            --name gateway \
            --resource-group "$RESOURCE_GROUP" \
            --output none 2>&1

        if [ $? -eq 0 ]; then
            log_success "Gateway container app restarted"
            # Wait for restart to complete
            sleep 20
        else
            log_warning "Failed to restart gateway with revision command, trying alternative..."

            # Alternative: deactivate and reactivate the revision
            az containerapp revision deactivate \
                --name gateway \
                --resource-group "$RESOURCE_GROUP" \
                --revision "latest" \
                --output none 2>&1

            sleep 5

            az containerapp revision activate \
                --name gateway \
                --resource-group "$RESOURCE_GROUP" \
                --revision "latest" \
                --output none 2>&1

            if [ $? -eq 0 ]; then
                log_success "Gateway container app restarted via deactivate/activate"
                sleep 20
            else
                log_warning "Failed to restart gateway, but update may still work without restart"
            fi
        fi

    else
        log_error "Failed to update gateway environment variables"
        return 1
    fi

    # Clean up temp file
    rm -f /tmp/gateway_env.json
}

configure_cors_after_deploy() {
    log_info "Configuring CORS for Container Apps (not supported in Bicep)..."

    # Enable CORS for all services
    services=("gateway" "auth-service" "events-service" "projects-service" "participants-service" "notifications-service")

    for service in "${services[@]}"; do
        log_info "Configuring CORS for $service..."

        # First check if container app exists
        if az containerapp show --name "$service" --resource-group "$RESOURCE_GROUP" --output none 2>/dev/null; then
            az containerapp ingress cors update \
                --name $service \
                --resource-group $RESOURCE_GROUP \
                --allowed-origins "*" \
                --allowed-methods "GET,POST,PUT,DELETE,OPTIONS" \
                --allowed-headers "Content-Type,Authorization" \
                --output none 2>&1 || log_warning "CORS config may not be supported for $service"
        else
            log_warning "Container app '$service' does not exist - skipping CORS config"
        fi
    done

    log_success "CORS configuration completed"
}

show_results() {
    log_info "Deployment completed successfully!"

    echo ""
    echo "=== 🚀 Application URLs ==="
    echo "Frontend: https://$FRONTEND_URL"
    echo "API Gateway: https://$GATEWAY_URL"
    echo ""

    echo "=== 🔐 IMPORTANT: JWT Secret (Copy this!) ==="
    echo "JWT_SECRET = $JWT_SECRET"
    echo ""

    echo "=== 📋 Complete GitHub Secrets Setup ==="
    echo "Go to: https://github.com/GabrielNichols/Innovation-Platform---Events--EngSoft-/settings/secrets/actions"
    echo ""
    echo "Add these secrets:"
    echo "AZURE_CREDENTIALS: [Generated by 'az ad sp create-for-rbac']"
    echo "AZURE_RESOURCE_GROUP: $RESOURCE_GROUP"
    echo "AZURE_CONTAINER_ENV: innovation-platform-env"
    echo "AZURE_STATIC_WEB_APPS_PUBLISH_PROFILE: $PUBLISH_PROFILE"
    echo "JWT_SECRET: $JWT_SECRET"
    echo ""

    echo "=== 📊 Service Status ==="
    az containerapp list \
        --resource-group $RESOURCE_GROUP \
        --query "[].{name:name, status:properties.provisioningState}" \
        -o table 2>/dev/null || echo "Could not retrieve service status"

    echo ""
    echo "=== 💰 Estimated Monthly Cost ==="
    echo "Azure Static Web Apps: FREE (up to 100GB bandwidth)"
    echo "Azure Container Apps (6 services): ~R$ 45-80/month"
    echo "Total: ~R$ 45-80/month"
    echo ""

    echo "=== 📋 Next Steps ==="
    echo "1. Copy the JWT_SECRET above to GitHub Secrets"
    echo "2. Push code to trigger CI/CD"
    echo "3. Test your application at the URLs above"
    echo ""
}

main() {
    echo "🚀 Innovation Platform - Bicep Deployment"
    echo "========================================"
    echo "Using: Azure Bicep + Static Web Apps + Container Apps"
    echo ""

    # Parse command line arguments
    RUN_DIAGNOSTIC=false
    CLEANUP=false
    DIAGNOSE=false
    FIX_GATEWAY=false
    FIX_ALL_JWT=false
    TEST_GATEWAY=false
    TEST_GATEWAY_PROD=false
    TEST_URLS=false

    while [[ $# -gt 0 ]]; do
        case $1 in
            --diagnostic)
                RUN_DIAGNOSTIC=true
                shift
                ;;
            --cleanup)
                CLEANUP=true
                shift
                ;;
            --diagnose)
                DIAGNOSE=true
                shift
                ;;
                    --fix-gateway)
                FIX_GATEWAY=true
                shift
                ;;
            --fix-all-jwt)
                FIX_ALL_JWT=true
                shift
                ;;
            --test-gateway)
                TEST_GATEWAY=true
                shift
                ;;
            --test-gateway-prod)
                TEST_GATEWAY_PROD=true
                shift
                ;;
            --test-urls)
                TEST_URLS=true
                shift
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --diagnostic        Run diagnostic checks before deployment"
                echo "  --diagnose          Run diagnostics on existing deployment"
                echo "  --fix-gateway       Fix gateway environment variables and test"
                echo "  --fix-all-jwt       Fix JWT_SECRET for ALL services"
                echo "  --cleanup           Clean up failed deployment artifacts"
                echo "  --test-gateway      Test gateway functionality after deployment"
                echo "  --test-gateway-prod Test gateway production configuration"
                echo "  --test-urls         Test URL extraction"
                echo "  --help              Show this help message"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done

    check_prerequisites
    check_region_availability

    if [ "$RUN_DIAGNOSTIC" = true ]; then
        diagnostic_check
    fi

    if [ "$CLEANUP" = true ]; then
        cleanup_failed_deployment
    fi

    if [ "$DIAGNOSE" = true ]; then
        log_info "Running diagnostics on existing deployment..."
        diagnose_container_apps
        test_internal_connectivity
        exit 0
    fi

    if [ "$FIX_GATEWAY" = true ]; then
        log_info "Running gateway environment variable fix..."
        check_prerequisites
        force_update_gateway_env_vars
        diagnose_container_apps
        test_gateway_after_env_update
        exit 0
    fi

    if [ "$FIX_ALL_JWT" = true ]; then
        log_info "Running JWT_SECRET fix for ALL services..."
        check_prerequisites
        force_update_all_services_env_vars
        diagnose_container_apps
        test_gateway_after_env_update
        exit 0
    fi

    generate_jwt_secret
    update_parameters_file

    echo ""
    log_info "Starting deployment process in region: $LOCATION"
    echo ""

    create_resource_group
    cleanup_failed_resources   # Clean up any failed resources first
    build_images               # Build Docker images first
    push_images_to_acr         # Push images to ACR
    deploy_complete_infrastructure  # Deploy everything with ACR images
    get_deployment_outputs
    force_update_gateway_env_vars
    diagnose_container_apps
    test_gateway_after_env_update
    test_internal_connectivity
    configure_cors_after_deploy
    show_results

    # Run tests if requested
    if [ "$TEST_GATEWAY" = true ]; then
        test_gateway
    fi

    if [ "$TEST_GATEWAY_PROD" = true ]; then
        test_gateway_prod
    fi

    if [ "$TEST_URLS" = true ]; then
        test_urls
    fi

    echo ""
    log_success "🎉 Bicep deployment completed!"
    log_info "Infrastructure as Code rocks! 🚀"
    echo ""
    echo "💡 Troubleshooting tips:"
    echo "   - If deployment fails, run: $0 --diagnostic --cleanup"
    echo "   - Check Azure portal for resource status"
    echo "   - Review deployment logs with: az monitor activity-log list --resource-group $RESOURCE_GROUP"
}

# Test scripts embedded in the deployment script

test_gateway_prod() {
    log_info "Testing Production Gateway Functionality"

    GATEWAY_URL="https://gateway.mangorock-348e27b8.eastus2.azurecontainerapps.io"
    echo "Gateway URL: $GATEWAY_URL"
    echo ""

    # Test 1: Root endpoint
    echo "1. Testing root endpoint..."
    curl -s -w "\nStatus: %{http_code}\n" "$GATEWAY_URL/" | head -20
    echo ""

    # Test 2: Docs endpoint
    echo "2. Testing /docs endpoint..."
    curl -s -w "\nStatus: %{http_code}\n" "$GATEWAY_URL/docs" | head -10
    echo ""

    # Test 3: Check if services are configured
    echo "3. Checking container app environment variables..."
    echo "Gateway environment variables:"
    az containerapp show \
        --name gateway \
        --resource-group "$RESOURCE_GROUP" \
        --query "properties.template.containers[0].env" \
        -o json | jq '.[] | select(.name | contains("SERVICE_URL"))' 2>/dev/null || echo "Could not retrieve env vars"
    echo ""

    # Test 4: Check service URLs
    echo "4. Checking service URLs from deployment..."
    az deployment group show \
        --resource-group "$RESOURCE_GROUP" \
        --name "$DEPLOYMENT_NAME" \
        --query "properties.outputs" \
        -o json 2>/dev/null || echo "Could not retrieve deployment outputs"
    echo ""

    log_success "Gateway production testing completed!"
}

test_gateway() {
    log_info "Testing Gateway Functionality"

    GATEWAY_URL="https://gateway.mangorock-348e27b8.eastus2.azurecontainerapps.io"
    echo "Gateway URL: $GATEWAY_URL"
    echo ""

    # Test 1: Root endpoint
    echo "1. Testing root endpoint..."
    curl -s -w "\nStatus: %{http_code}\n" "$GATEWAY_URL/" | head -20
    echo ""

    # Test 2: Health check
    echo "2. Testing /docs endpoint..."
    curl -s -w "\nStatus: %{http_code}\n" "$GATEWAY_URL/docs" | head -10
    echo ""

    # Test 3: Auth service route
    echo "3. Testing auth service route (/api/auth/health)..."
    curl -s -w "\nStatus: %{http_code}\n" "$GATEWAY_URL/api/auth/health" | head -10
    echo ""

    # Test 4: Events service route
    echo "4. Testing events service route (/api/events/)..."
    curl -s -w "\nStatus: %{http_code}\n" "$GATEWAY_URL/api/events/" | head -10
    echo ""

    # Test 5: Notifications service route
    echo "5. Testing notifications service route (/api/notifications/)..."
    curl -s -w "\nStatus: %{http_code}\n" "$GATEWAY_URL/api/notifications/" | head -10
    echo ""

    log_success "Gateway testing completed!"
}

test_urls() {
    log_info "Testing URL extraction"

    # Extract URLs from deployment outputs
    FRONTEND_URL=$(az staticwebapp show \
        --name innovation-platform-frontend \
        --resource-group $RESOURCE_GROUP \
        --query "defaultHostname" -o tsv 2>/dev/null || echo "NotAvailable")

    echo "Frontend URL: $FRONTEND_URL"

    GATEWAY_URL=$(az deployment group show \
        --resource-group $RESOURCE_GROUP \
        --name "$DEPLOYMENT_NAME" \
        --query "properties.outputs.gatewayUrl.value" -o tsv 2>/dev/null || echo "NotAvailable")

    echo "Gateway URL from deployment: $GATEWAY_URL"

    # If gateway URL is not available from deployment outputs, try to get it directly
    if [ "$GATEWAY_URL" = "NotAvailable" ]; then
        GATEWAY_URL=$(az containerapp show \
            --name gateway \
            --resource-group $RESOURCE_GROUP \
            --query "properties.configuration.ingress.fqdn" -o tsv 2>/dev/null || echo "NotAvailable")
    fi

    echo "Final Gateway URL: $GATEWAY_URL"

    echo "=== 🚀 Application URLs ==="
    echo "Frontend: https://$FRONTEND_URL"
    echo "API Gateway: https://$GATEWAY_URL"

    log_success "URL testing completed!"
}

# Run main function
main "$@"
