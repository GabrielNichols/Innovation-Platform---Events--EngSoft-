# Participants Service API

## GET /api/events/{eventId}/participants
List participants for an event (organizers/admins only).

## POST /api/events/{eventId}/register
Register the current user to an event. Event must be `published` and capacity limits are enforced.

## POST /api/events/{eventId}/participants/{participantId}/approve
Approve a pending or waitlisted participant.

## POST /api/events/{eventId}/participants/{participantId}/reject
Reject a participant. Final for approved/rejected entries.

## GET /api/events/{eventId}/participants/export
Download a CSV snapshot of participants.
