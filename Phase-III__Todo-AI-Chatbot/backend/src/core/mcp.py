"""MCP Server initialization using the Official MCP SDK.

This module sets up the MCP server that exposes task management tools
to the AI agent. The MCP server runs as part of the FastAPI application
and provides stateless tool execution.
"""
from collections.abc import Callable
from dataclasses import dataclass, field
from typing import Any

from mcp.server import Server
from mcp.types import Tool, TextContent


@dataclass
class MCPToolRegistry:
    """Registry for MCP tools with their handlers.

    Provides a centralized way to register and manage MCP tools
    that can be invoked by the AI agent.
    """

    tools: dict[str, Tool] = field(default_factory=dict)
    handlers: dict[str, Callable[..., Any]] = field(default_factory=dict)

    def register_tool(
        self,
        name: str,
        description: str,
        input_schema: dict[str, Any],
        handler: Callable[..., Any],
    ) -> None:
        """Register an MCP tool with its handler.

        Args:
            name: Unique tool name
            description: Tool description for the AI agent
            input_schema: JSON Schema for tool input validation
            handler: Async function to execute the tool
        """
        self.tools[name] = Tool(
            name=name,
            description=description,
            inputSchema=input_schema,
        )
        self.handlers[name] = handler

    def get_tool(self, name: str) -> Tool | None:
        """Get a registered tool by name."""
        return self.tools.get(name)

    def get_handler(self, name: str) -> Callable[..., Any] | None:
        """Get a tool handler by name."""
        return self.handlers.get(name)

    def list_tools(self) -> list[Tool]:
        """List all registered tools."""
        return list(self.tools.values())


# Global tool registry instance
tool_registry = MCPToolRegistry()


def create_mcp_server() -> Server:
    """Create and configure the MCP server.

    Returns:
        Configured MCP Server instance
    """
    server = Server("todo-chatbot-mcp")

    @server.list_tools()
    async def handle_list_tools() -> list[Tool]:
        """Handle MCP list_tools request."""
        return tool_registry.list_tools()

    @server.call_tool()
    async def handle_call_tool(name: str, arguments: dict[str, Any]) -> list[TextContent]:
        """Handle MCP tool invocation.

        Args:
            name: Name of the tool to invoke
            arguments: Tool arguments

        Returns:
            List of TextContent with tool results
        """
        handler = tool_registry.get_handler(name)
        if handler is None:
            return [TextContent(type="text", text=f"Error: Unknown tool '{name}'")]

        try:
            result = await handler(**arguments)
            return [TextContent(type="text", text=str(result))]
        except Exception as e:
            return [TextContent(type="text", text=f"Error executing tool '{name}': {e}")]

    return server


# Global MCP server instance
mcp_server = create_mcp_server()
