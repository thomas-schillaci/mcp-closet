# Constraint-Aware Interactive Decision Engine (MCP App Demo)

Turning natural language into structured, interactive decision systems
inside ChatGPT.

## Overview

This project is an MCP App that demonstrates how large language models
can orchestrate stateful, constraint-based decision spaces, not just
generate text responses.

The current demo uses a small curated wardrobe as a visual example. The
focus is not fashion --- it is the interaction pattern:

Natural language → structured constraints → tool call → interactive
widget → state update → model recompute.

------------------------------------------------------------------------

## What This Demonstrates

This MCP App shows how to:

-   Parse natural language into structured signals
    (e.g. context/formality)
-   Trigger a tool call from the model
-   Render structured combinations inside a widget
-   Synchronize state between widget and model
-   Recompute compatibility dynamically when selections change

The inventory is intentionally small to isolate and highlight the
model--tool--widget interaction loop.

------------------------------------------------------------------------

## How It Works

### 1. Natural Language Input

Example: "Business casual dinner"

The model extracts structured constraints (e.g. formality level).

### 2. Tool Invocation

The model calls a tool that:

-   Generates valid item combinations
-   Computes a compatibility score
-   Returns structured data to the widget

### 3. Interactive Widget

The widget renders:

-   Tops
-   Bottoms
-   Shoes
-   A compatibility score

When a user swaps an item:

-   The widget updates its state
-   State is sent back to the model
-   The model recomputes compatibility
-   The widget re-renders with updated scoring

This demonstrates bidirectional MCP communication in a live decision
loop.

------------------------------------------------------------------------

## Current Scope

This version focuses on:

-   Context/formality-based compatibility
-   Combination generation
-   Stateful model--widget synchronization

Budget and weather constraints are not enforced in this demo.\
However, the scoring architecture is modular and designed to support
additional constraint dimensions without changing the interaction
pattern.

------------------------------------------------------------------------

## Architecture

Server: - Defines tools - Encodes constraint logic - Computes
compatibility scores

Widget: - Renders structured options - Sends updated selection state
back to the model - Displays recomputed results

MCP: - Manages bidirectional communication between model and widget

Core loop:

Natural language → Structured constraints → Tool call → Widget render →
State update → Model recompute → Widget update

------------------------------------------------------------------------

## Why This Matters

Standard chat interfaces produce recommendations.\
MCP Apps enable interactive, stateful decision systems inside LLM hosts.

This pattern generalizes beyond the demo domain.

Potential extensions include:

-   Budget-aware recomputation
-   Weather-based filtering
-   Style re-ranking (e.g. "more minimalist")
-   Live inventory connectors
-   Travel planning
-   Hardware configuration
-   Hiring shortlists
-   Any multi-variable constrained decision problem

------------------------------------------------------------------------

## Key Insight

MCP Apps transform natural language from a prompt into structured input
for interactive systems.

This repository demonstrates that architectural pattern.