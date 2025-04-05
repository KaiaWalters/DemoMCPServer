#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';


const myServer = new Server({
    name: "bigwinfit",
    version: "0.1.0",
}, {
    capabilities: {
        tools: {},
    },
});

const axiosInstance = axios.create({
    baseURL: 'https://localhost:3001', // makes an axios instace for my api
    timeout: 5000,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
})

    myServer.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: [
            {
                name: 'get_events_for_this_month',
                description: 'Get a summary of latest events for the month',
                inputSchema: {
                  type: 'object',
                  properties: { url: { type: "string", description: "URL of events listed for this month" }},
                  required: ['url'],
                },
              },
        ]
    }))

    myServer.setRequestHandler(CallToolRequestSchema, async (request) => {
        if (request.params.name !== "get_events_for_this_month") {
          throw new Error(`Unknown tool: ${request.params.name}`);
        }

        try {
          const { url } = request.params.arguments as { url: string };
            
          const response = await axiosInstance.get(`${url}/content/events`);
          const eventsText = response.data; 
            console.log("response returned from /content/events", eventsText)
            //go through each event and create a string containing all event title dates and descriptions

          return {
            content: [
              {
                type: "text",
                text: eventsText,
              },
            ],
          };
        } catch (err) {
          return {
            content: [
              {
                type: "text",
                text: `Error retrieving events fot this month: ${err}`,
              },
            ],
            isError: true,
          };
        }
      });

async function main() {
    const transport = new StdioServerTransport();
    await myServer.connect(transport);
    console.error('Your MCP server is running on stdio');
  }
  
  main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
  });