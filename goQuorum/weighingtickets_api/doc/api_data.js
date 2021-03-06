define({ "api": [
  {
    "type": "get",
    "url": "/",
    "title": "Index page of this API.",
    "name": "IndexPage",
    "group": "Index",
    "version": "0.0.0",
    "filename": "src/controllers/index.js",
    "groupTitle": "Index"
  },
  {
    "type": "delete",
    "url": "/tickets/:ticket_id",
    "title": "Delete Ticket",
    "name": "DeleteTicket",
    "permission": [
      {
        "name": "Client",
        "title": "Only an authenticated client can access this route.",
        "description": ""
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "ticket_id",
            "description": "<p>The identifier of the ticket</p>"
          }
        ]
      }
    },
    "group": "Tickets",
    "examples": [
      {
        "title": "Deleting a ticket.",
        "content": "http://host:port/tickets/C1-SSN1-1533784732",
        "type": "json"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "The",
            "description": "<p>identifier of the deleted WeighingTicket.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/tickets.js",
    "groupTitle": "Tickets"
  },
  {
    "type": "get",
    "url": "/tickets/:ticket_id",
    "title": "Get Ticket by ID",
    "name": "GetTicket",
    "permission": [
      {
        "name": "Client",
        "title": "Only an authenticated client can access this route.",
        "description": ""
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "ticket_id",
            "description": "<p>The identifier of the ticket</p>"
          }
        ]
      }
    },
    "group": "Tickets",
    "examples": [
      {
        "title": "Consulting one Ticket with its ID",
        "content": "http://host:port/tickets/C1-SSN1-1736473872",
        "type": "json"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "ticket",
            "description": "<p>The ticket with ticket_id</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/tickets.js",
    "groupTitle": "Tickets"
  },
  {
    "type": "get",
    "url": "/tickets",
    "title": "Get All Tickets.",
    "name": "GetTickets",
    "permission": [
      {
        "name": "Client",
        "title": "Only an authenticated client can access this route.",
        "description": ""
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "from_date",
            "description": "<p>The begin date to search for tickets. Required format: dd-mm-yyyy hh:mm:ss or a timestamp</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "until_date",
            "description": "<p>The end date to search for tickets. Required format: dd-mm-yyyy hh:mm:ss or a timestamp.</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "from_weight",
            "description": "<p>The begin weight to search for tickets.</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "until_weight",
            "description": "<p>The end weight to search for tickets.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "scale_serial_number",
            "description": "<p>The serial number of the station to look for.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "terminal_serial_number",
            "description": "<p>The serial number of the terminal to look for.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "date_type",
            "description": "<p>By default, permits &quot;simple_date&quot;, &quot;simple_date_hour&quot;, &quot;full_date&quot;, &quot;timestamp&quot;</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "group_by",
            "description": "<p>The attribute by which the tickets should be grouped. Either &quot;terminalSerialNumber&quot;, &quot;scaleSerialNumber&quot;, &quot;scaleStatus&quot;, &quot;terminalRestartValue&quot; or &quot;timestamp&quot;</p>"
          }
        ]
      }
    },
    "group": "Tickets",
    "examples": [
      {
        "title": "Consulting all your tickets, with some filters and grouping.",
        "content": "http://host:port/tickets?scale_serial_number=SSN1&from_date=1-2-2020 15:15:15&group_by=scaleStatus&date_type=full_date",
        "type": "json"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Any",
            "optional": false,
            "field": "tickets",
            "description": "<p>The tickets of the given client. If group_by is specified returns an object where keys are the possible values, otherwise returns an array of tickets.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/tickets.js",
    "groupTitle": "Tickets"
  },
  {
    "type": "post",
    "url": "/tickets",
    "title": "Register Ticket.",
    "name": "RegisterTicket",
    "permission": [
      {
        "name": "Client",
        "title": "Only an authenticated client can access this route.",
        "description": ""
      }
    ],
    "group": "Tickets",
    "examples": [
      {
        "title": "Registering a ticket.",
        "content": "http://host:port/tickets\n\nbody: {\n   \"terminalSerialNumber\": \"TSN1\",\n      \"terminalRestartValue\": \"R0\",\n      \"scaleSerialNumber\": \"SSN1\",\n      \"scaleStatus\": \"OK\",\n      \"scaleGross\": 4700,\n      \"scaleNet\": 4700,\n      \"cellsArray\": [\n          {\n              \"cellSerialNumber\": \"LC1\",\n              \"cellWeight\": 500\n          },\n          {\n              \"cellSerialNumber\": \"LC2\",\n              \"cellWeight\": 500\n          },\n          {\n              \"cellSerialNumber\": \"LC3\",\n              \"cellWeight\": 500\n          },\n          {\n              \"cellSerialNumber\": \"LC4\",\n              \"cellWeight\": 500\n          },\n          {\n              \"cellSerialNumber\": \"LC5\",\n              \"cellWeight\": 500\n          },\n          {\n              \"cellSerialNumber\": \"LC6\",\n              \"cellWeight\": 500\n          },\n          {\n              \"cellSerialNumber\": \"LC7\",\n              \"cellWeight\": 500\n          },\n          {\n              \"cellSerialNumber\": \"LC8\",\n              \"cellWeight\": 500\n          }\n      ]\n}",
        "type": "json"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "Returns",
            "description": "<p>the transaction hash under the 'transactionHash' key and the ticket identifier under the 'ticketID' key.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/tickets.js",
    "groupTitle": "Tickets"
  },
  {
    "type": "put",
    "url": "/tickets/:ticket_id",
    "title": "Update Ticket.",
    "name": "UpdateTicket",
    "permission": [
      {
        "name": "Client",
        "title": "Only an authenticated client can access this route.",
        "description": ""
      }
    ],
    "deprecated": {
      "content": "@apiParam {String} ticket_id The identifier of the ticket"
    },
    "group": "Tickets",
    "version": "0.0.0",
    "filename": "src/controllers/tickets.js",
    "groupTitle": "Tickets"
  }
] });
