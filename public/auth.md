# Auth.md

Volt.az provides a small public interface for AI assistants. Public product discovery, product details, service discovery, and planning estimates do not require registration or sign-in.

## Public access

- API documentation: https://api.volt.az/swagger/index.html
- API catalog: https://volt.az/.well-known/api-catalog
- Agent Skills index: https://volt.az/.well-known/agent-skills/index.json
- MCP Server Card: https://volt.az/.well-known/mcp/server-card.json
- Agentic resource catalog: https://volt.az/.well-known/ai-catalog.json
- WebMCP manifest: https://volt.az/.well-known/webmcp
- Public API base: https://api.volt.az/api/public-agent
- Public MCP endpoint: https://mcp.volt.az/public/mcp

Agents may read only information already available to ordinary visitors. No API key, cookie, bearer token, customer account, or admin account is required for the public endpoints.

## Contact requests

An agent may prepare a short-lived contact-request draft through the public interface. Preparing a draft does not submit it. The visitor must open the returned Volt.az confirmation URL, review the details, and explicitly confirm the request before it is sent.

Agents must not automate the confirmation step, retain the one-time draft token, or claim that a request was submitted before the visitor confirms it.

## Customer and administrator accounts

Volt.az does not permit autonomous agents to create accounts, sign in as customers, access customer data, or access the administrator panel. Customer and administrator authentication remains a human-operated website flow.

The public MCP and public REST interface are anonymous and never expose customer, order, warehouse, project, or administrator data. Volt also operates a separate read-only internal MCP resource for explicitly authorised identities. Its canonical OAuth Protected Resource Metadata is available at https://mcp.volt.az/.well-known/oauth-protected-resource/mcp. A compatibility redirect is published at https://volt.az/.well-known/oauth-protected-resource.

## Security and support

Never send passwords, access tokens, payment details, or other secrets to the public agent endpoints. For assistance, use https://volt.az/contact.
