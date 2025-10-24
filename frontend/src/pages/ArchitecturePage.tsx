import React from 'react';
import { GlassCard } from '../components/GlassCard';
import { ArrowRight, Database, Server, Cpu, Lock, Zap, Cloud } from 'lucide-react';

export function ArchitecturePage() {
  return (
    <div className="min-h-screen page-background p-4 md:p-8 pb-24">
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="mb-2">Arquitetura do Sistema</h1>
          <p className="text-muted-foreground">
            Plataforma de Inovação Colaborativa com IA
          </p>
        </div>

        {/* Architecture Diagram */}
        <div className="space-y-8">
          {/* Frontend Layer */}
          <div>
            <h2 className="mb-4">Frontend Layer</h2>
            <GlassCard elevation="high" className="glass-gradient">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                  <Server className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3>Single Page Application (SPA)</h3>
                  <p className="text-muted-foreground">React + TypeScript</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-subtle rounded-lg p-4">
                  <h4 className="mb-2">UI Components</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• React Components</li>
                    <li>• Tailwind CSS</li>
                    <li>• Glass Morphism</li>
                    <li>• Responsive Design</li>
                  </ul>
                </div>
                <div className="glass-subtle rounded-lg p-4">
                  <h4 className="mb-2">State Management</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• React Hooks</li>
                    <li>• Context API</li>
                    <li>• Local Storage</li>
                    <li>• Real-time Updates</li>
                  </ul>
                </div>
                <div className="glass-subtle rounded-lg p-4">
                  <h4 className="mb-2">Routing & Navigation</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Client-side Routing</li>
                    <li>• Protected Routes</li>
                    <li>• Deep Linking</li>
                    <li>• Mobile Navigation</li>
                  </ul>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Arrow Down */}
          <div className="flex justify-center">
            <div className="h-12 w-1 bg-gradient-to-b from-teal-500 to-emerald-600 rounded-full" />
          </div>

          {/* API Gateway */}
          <div>
            <h2 className="mb-4">API Gateway</h2>
            <GlassCard elevation="medium" className="bg-gradient-to-r from-teal-500/10 to-emerald-500/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3>API Gateway & Load Balancer</h3>
                  <p className="text-muted-foreground">Request Routing & Authentication</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-subtle rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="h-5 w-5 text-green-500" />
                    <h4>Authentication</h4>
                  </div>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• JWT Token Validation</li>
                    <li>• OAuth 2.0 (Google, GitHub)</li>
                    <li>• Session Management</li>
                    <li>• Role-based Access Control</li>
                  </ul>
                </div>
                <div className="glass-subtle rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowRight className="h-5 w-5 text-teal-500" />
                    <h4>Request Routing</h4>
                  </div>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Service Discovery</li>
                    <li>• Load Balancing</li>
                    <li>• Rate Limiting</li>
                    <li>• API Versioning</li>
                  </ul>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Arrow Down */}
          <div className="flex justify-center">
            <div className="h-12 w-1 bg-gradient-to-b from-teal-500 to-emerald-600 rounded-full" />
          </div>

          {/* Backend Services */}
          <div>
            <h2 className="mb-4">Backend Services (Microservices)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <GlassCard elevation="medium" className="bg-white dark:bg-zinc-800">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Server className="h-5 w-5 text-white" />
                  </div>
                  <h4>User Service</h4>
                </div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• User Management</li>
                  <li>• Profile CRUD</li>
                  <li>• Skills & Portfolio</li>
                  <li>• Availability Status</li>
                </ul>
              </GlassCard>

              <GlassCard elevation="medium" className="bg-white dark:bg-zinc-800">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                    <Server className="h-5 w-5 text-white" />
                  </div>
                  <h4>Project Service</h4>
                </div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Project CRUD</li>
                  <li>• Team Management</li>
                  <li>• Position Listings</li>
                  <li>• Applications</li>
                </ul>
              </GlassCard>

              <GlassCard elevation="medium" className="bg-white dark:bg-zinc-800">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <Cpu className="h-5 w-5 text-white" />
                  </div>
                  <h4>AI Matchmaking</h4>
                </div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Skill Matching</li>
                  <li>• Recommendation Engine</li>
                  <li>• Score Calculation</li>
                  <li>• ML Models</li>
                </ul>
              </GlassCard>

              <GlassCard elevation="medium" className="bg-white dark:bg-zinc-800">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                    <Server className="h-5 w-5 text-white" />
                  </div>
                  <h4>Messaging Service</h4>
                </div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Real-time Chat</li>
                  <li>• Invitations</li>
                  <li>• Notifications</li>
                  <li>• WebSocket Support</li>
                </ul>
              </GlassCard>

              <GlassCard elevation="medium" className="bg-white dark:bg-zinc-800">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
                    <Server className="h-5 w-5 text-white" />
                  </div>
                  <h4>Event Service</h4>
                </div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Event Management</li>
                  <li>• Team Formation</li>
                  <li>• Submissions</li>
                  <li>• Analytics</li>
                </ul>
              </GlassCard>

              <GlassCard elevation="medium" className="bg-white dark:bg-zinc-800">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                    <Lock className="h-5 w-5 text-white" />
                  </div>
                  <h4>Admin Service</h4>
                </div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Content Moderation</li>
                  <li>• User Management</li>
                  <li>• Tag Management</li>
                  <li>• Analytics Dashboard</li>
                </ul>
              </GlassCard>
            </div>
          </div>

          {/* Arrow Down */}
          <div className="flex justify-center">
            <div className="h-12 w-1 bg-gradient-to-b from-green-500 to-orange-600 rounded-full" />
          </div>

          {/* Data Layer */}
          <div>
            <h2 className="mb-4">Data Layer</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GlassCard elevation="medium" className="bg-white dark:bg-zinc-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                    <Database className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3>PostgreSQL</h3>
                    <p className="text-muted-foreground">Relational Database</p>
                  </div>
                </div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• User Data</li>
                  <li>• Project Data</li>
                  <li>• Messages</li>
                  <li>• Transactions</li>
                  <li>• ACID Compliance</li>
                </ul>
              </GlassCard>

              <GlassCard elevation="medium" className="bg-white dark:bg-zinc-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                    <Cpu className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3>Vector Database</h3>
                    <p className="text-muted-foreground">AI/ML Embeddings</p>
                  </div>
                </div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Skill Embeddings</li>
                  <li>• Similarity Search</li>
                  <li>• Project Matching</li>
                  <li>• Recommendation Vectors</li>
                  <li>• Fast Retrieval</li>
                </ul>
              </GlassCard>

              <GlassCard elevation="medium" className="bg-white dark:bg-zinc-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3>Redis Cache</h3>
                    <p className="text-muted-foreground">In-memory Cache</p>
                  </div>
                </div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Session Storage</li>
                  <li>• API Response Cache</li>
                  <li>• Real-time Data</li>
                  <li>• Performance Boost</li>
                </ul>
              </GlassCard>

              <GlassCard elevation="medium" className="bg-white dark:bg-zinc-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                    <Cloud className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3>Object Storage</h3>
                    <p className="text-muted-foreground">Files & Media</p>
                  </div>
                </div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• User Avatars</li>
                  <li>• Portfolio Files</li>
                  <li>• Project Assets</li>
                  <li>• CDN Integration</li>
                </ul>
              </GlassCard>
            </div>
          </div>

          {/* Infrastructure */}
          <div className="mt-8">
            <h2 className="mb-4">Infrastructure & DevOps</h2>
            <GlassCard elevation="high" className="glass-gradient">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-subtle rounded-lg p-4 text-center">
                  <Cloud className="h-8 w-8 mx-auto mb-2 text-teal-500" />
                  <h4 className="mb-2">Cloud Provider</h4>
                  <p className="text-muted-foreground">AWS / GCP / Azure</p>
                </div>
                <div className="glass-subtle rounded-lg p-4 text-center">
                  <Server className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <h4 className="mb-2">Containers</h4>
                  <p className="text-muted-foreground">Docker + Kubernetes</p>
                </div>
                <div className="glass-subtle rounded-lg p-4 text-center">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                  <h4 className="mb-2">CI/CD</h4>
                  <p className="text-muted-foreground">GitHub Actions</p>
                </div>
                <div className="glass-subtle rounded-lg p-4 text-center">
                  <Lock className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <h4 className="mb-2">Security</h4>
                  <p className="text-muted-foreground">SSL/TLS + WAF</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
