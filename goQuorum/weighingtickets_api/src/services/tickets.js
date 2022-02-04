const Service = module.exports;
const Abstractors = require('../helpers/abstractors');
const TicketValidator = require('../helpers/validators/ticketsValidator');
const ErrorProducer = require('../helpers/errorProducer');
const Connection = require('../connection/connection');

/**
 * Retrieves the ticket with ticketID belonging to the client with clientID.
 * @param fromAddress The address of the node that sends the transaction. String.
 * @param node The url of the node to connect to.
 * @param contractAddress The address of the customer's contract.
 * @param clientID The client's identifier. String.
 * @param ticketID The ticket's identifier. String.
 * @returns {Promise<object>} An object with the information of the Weighing Ticket.
 */
Service.getTicket = async (fromAddress, node, contractAddress, clientID, ticketID) => {
  const { provider, abi } = await Connection.connect(node);
  const contract = new provider.eth.Contract(abi, contractAddress);
  let ticket = await contract.methods.getTicket(clientID, ticketID).call({ from: fromAddress });
  if (TicketValidator.isNull(ticket)) {
    throw ErrorProducer.produceTicketDoesNotExistError(ticketID);
  }
  ticket = Abstractors.ticketToJSON(ticket);
  return ticket;
};

/**
 * Retrieves all the tickets from the client with clientID.
 * @param fromAddress The address of the node that sends the transaction. String.
 * @param clientID The client's identifier. String.
 * @param node The node URL to connect to.
 * @param contractAddress The address of the customer's contract.
 * @param dateFormat The format to output the date. String. Defaults to full_date
 * @returns {Promise<array>} An array of Weighing Ticket objects.
 */
Service.getAllTickets = async (
  fromAddress, clientID, node, contractAddress, dateFormat = 'full_date') => {
  const { provider, abi } = await Connection.connect(node);
  const contract = new provider.eth.Contract(abi, contractAddress);
  let tickets = await contract.methods.getTickets(clientID).call({ from: fromAddress });
  tickets = await tickets.map(
    ticket => Abstractors.ticketToJSON(ticket, dateFormat));
  return tickets;
};

/**
 * Retrieves all the tickets filtered by weights from the client with clientID.
 * Note: Although fromWeight and untilWeight are both optional, at least one has to be
 * provided for the operation to make sense.
 * @param fromAddress The address of the node that sends the transaction. String.
 * @param clientID The client's identifier. String.
 * @param node The node URL to connect to.
 * @param contractAddress The address of the customer's contract.
 * @param fromWeight The minimum weight the Weighing Ticket should have to be considered. Float. Optional.
 * @param untilWeight The maximum weight the Weighing Ticket should have to be considered. Float. Optional.
 * @returns {Promise<array>} An array of Weighing Tickets.
 */
Service.getTicketsByWeight = async (
  fromAddress, clientID, node, contractAddress, fromWeight = undefined, untilWeight = undefined) => {
  const { provider, abi } = await Connection.connect(node);
  const contract = new provider.eth.Contract(abi, contractAddress);
  let tickets;
  if (fromWeight) fromWeight = Abstractors.asInteger(fromWeight);
  if (untilWeight) untilWeight = Abstractors.asInteger(untilWeight);
  if (fromWeight && untilWeight) {
    tickets = await contract.methods.getTicketsByInterval(clientID,
      fromWeight, untilWeight, 'weight').call({ from: fromAddress });
  } else if (fromWeight) {
    tickets = await contract.methods.getTicketsByInteger(clientID, fromWeight,
      'above', 'weight').call({ from: fromAddress });
  } else if (untilWeight) {
    tickets = await contract.methods.getTicketsByInteger(clientID, untilWeight,
      'below', 'weight').call({ from: fromAddress });
  } else {
    tickets = [];
  }

  tickets = await tickets.map(
    ticket => Abstractors.ticketToJSON(ticket, 'timestamp'));
  return tickets;
};

/**
 * Retrieves all the tickets filtered by date from the client with clientID.
 * Note: Although fromDate and untilDate are both optional, at least one has to be
 * provided for the operation to make sense.
 * @param fromAddress The address of the node that sends the transaction. String.
 * @param clientID The client's identifier. String.
 * @param node The node URL to connect to.
 * @param contractAddress The address of the customer's contract.
 * @param fromDate The minimum timestamp the Weighing Ticket should have to be considered. Float. Optional.
 * @param untilDate The maximum timestamp the Weighing Ticket should have to be considered. Float. Optional.
 * @param tickets Perform filtering on these tickets instead of looking up in the blockchain. By default receives nothing in this parameter.
 * @returns {Promise<array>} An array of Weighing Tickets.
 */
Service.getTicketsByDate = async (
  fromAddress, clientID, node, contractAddress, fromDate = undefined, untilDate = undefined,
  tickets = []) => {
  let newTickets = [];
  if (tickets.length > 0) {
    if (fromDate && untilDate) {
      for (let i = 0; i < tickets.length; i++) {
        if (tickets[i].timestamp > fromDate && tickets[i].timestamp <
          untilDate) newTickets.push(tickets[i]);
      }
    } else if (fromDate) {
      for (let i = 0; i < tickets.length; i++) {
        if (tickets[i].timestamp > fromDate) newTickets.push(tickets[i]);
      }
    } else if (untilDate) {
      for (let i = 0; i < tickets.length; i++) {
        if (tickets[i].timestamp < untilDate) newTickets.push(tickets[i]);
      }
    }
  } else {
    const { provider, abi } = await Connection.connect(node);
    const contract = new provider.eth.Contract(abi, contractAddress);
    if (fromDate && untilDate) {
      newTickets = await contract.methods.getTicketsByInterval(clientID,
        fromDate, untilDate, 'date').call({ from: fromAddress });
    } else if (fromDate) {
      newTickets = await contract.methods.getTicketsByInteger(clientID,
        fromDate,
        'above', 'date').call({ from: fromAddress });
    } else if (untilDate) {
      newTickets = await contract.methods.getTicketsByInteger(clientID,
        untilDate,
        'below', 'date').call({ from: fromAddress });
    }

    newTickets = await newTickets.map(
      ticket => Abstractors.ticketToJSON(ticket, 'timestamp'));
  }

  return newTickets;
};

/**
 * Retrieves all the tickets filtered by the scale serial number from the client with clientID.
 * @param fromAddress The address of the node that sends the transaction. String.
 * @param clientID The client's identifier. String.
 * @param node The node URL to connect to.
 * @param contractAddress The address of the customer's contract.
 * @param scaleSerialNumber The serial number of the scale to consider. String.
 * @param tickets Perform filtering on these tickets instead of looking up in the blockchain. By default receives nothing in this parameter.
 * @returns {Promise<array>} An array of Weighing Tickets.
 */
Service.getTicketsByScale = async (
  fromAddress, clientID, node, contractAddress, scaleSerialNumber, tickets = []) => {
  if (!scaleSerialNumber) return tickets;
  let newTickets = [];
  if (tickets.length > 0) {
    for (let i = 0; i < tickets.length; i++) {
      if (tickets[i].scaleSerialNumber === scaleSerialNumber) newTickets.push(
        tickets[i]);
    }
  } else {
    const { provider, abi } = await Connection.connect(node);
    const contract = new provider.eth.Contract(abi, contractAddress);
    newTickets = await contract.methods.getTicketsByString(clientID,
      scaleSerialNumber, 'scaleSerialNumber').call({ from: fromAddress });
    newTickets = await newTickets.map(
      ticket => Abstractors.ticketToJSON(ticket, 'timestamp'));
  }

  return newTickets;
};

/**
 * Retrieves all the tickets filtered by the terminal serial number from the client with clientID.
 * @param fromAddress The address of the node that sends the transaction. String.
 * @param clientID The client's identifier. String.
 * @param node The node URL to connect to.
 * @param contractAddress The address of the customer's contract.
 * @param terminalSerialNumber The serial number of the terminal to consider. String.
 * @param tickets Perform filtering on these tickets instead of looking up in the blockchain. By default receives nothing in this parameter.
 * @returns {Promise<array>} An array of Weighing Tickets.
 */
Service.getTicketsByTerminal = async (
  fromAddress, clientID, node, contractAddress, terminalSerialNumber, tickets = []) => {
  if (!terminalSerialNumber) return tickets;
  let newTickets = [];
  if (tickets.length > 0) {
    for (let i = 0; i < tickets.length; i++) {
      if (tickets[i].terminalSerialNumber ===
        terminalSerialNumber) newTickets.push(tickets[i]);
    }
  } else {
    const { provider, abi } = await Connection.connect(node);
    const contract = new provider.eth.Contract(abi, contractAddress);
    newTickets = await contract.methods.getTicketsByString(
      clientID, terminalSerialNumber, 'terminalSerialNumber').call({ from: fromAddress });
    newTickets = await newTickets.map(
      ticket => Abstractors.ticketToJSON(ticket, 'timestamp'));
  }
  return newTickets;
};

/**
 * Retrieves all the tickets filtered by the scale status from the client with clientID.
 * @param fromAddress The address of the node that sends the transaction. String.
 * @param clientID The client's identifier. String.
 * @param node The node URL to connect to.
 * @param contractAddress The address of the customer's contract.
 * @param scaleStatus The status of the scale to consider. String.
 * @param tickets Perform filtering on these tickets instead of looking up in the blockchain. By default receives nothing in this parameter.
 * @returns {Promise<array>} An Array of Weighing Tickets.
 */
Service.getTicketsByScaleStatus = async (
  fromAddress, clientID, node, contractAddress, scaleStatus, tickets = []) => {
  if (!scaleStatus) return tickets;
  let newTickets = [];
  if (tickets.length > 0) {
    for (let i = 0; i < tickets.length; i++) {
      if (tickets[i].scaleStatus === scaleStatus) newTickets.push(tickets[i]);
    }
  } else {
    const { provider, abi } = await Connection.connect(node);
    const contract = new provider.eth.Contract(abi, contractAddress);
    newTickets = await contract.methods.getTicketsByString(clientID,
      scaleStatus, 'scaleStatus').call({ from: fromAddress });
    newTickets = await newTickets.map(
      ticket => Abstractors.ticketToJSON(ticket, 'timestamp'));
  }
  return newTickets;
};

/**
 * Retrieves all the tickets filtered by the terminal restart value from the client with clientID.
 * @param fromAddress The address of the node that sends the transaction. String.
 * @param clientID The client's identifier. String.
 * @param node The node URL to connect to.
 * @param contractAddress The address of the customer's contract.
 * @param terminalRestartValue The terminal restart value to consider. String.
 * @param tickets Perform filtering on these tickets instead of looking up in the blockchain. By default receives nothing in this parameter.
 * @returns {Promise<array>} An Array of Weighing Tickets.
 */
Service.getTicketsByTerminalRestartValue = async (
  fromAddress, clientID, node, contractAddress, terminalRestartValue, tickets = []) => {
  if (!terminalRestartValue) return tickets;
  let newTickets = [];
  if (tickets.length > 0) {
    for (let i = 0; i < tickets.length; i++) {
      if (tickets[i].terminalRestartValue ===
        terminalRestartValue) newTickets.push(tickets[i]);
    }
  } else {
    const { provider, abi } = await Connection.connect(node);
    const contract = new provider.eth.Contract(abi, contractAddress);
    newTickets = await contract.methods.getTicketsByString(
      clientID, terminalRestartValue, 'terminalRestartValue').call({ from: fromAddress });
    newTickets = await newTickets.map(
      ticket => Abstractors.ticketToJSON(ticket, 'timestamp'));
  }

  return newTickets;
};

/**
 * Registers a new ticket in the blockchain network.
 * @param fromAddress The address of the node that sends the transaction. String.
 * @param clientID The client's identifier. String.
 * @param node The node URL to connect to.
 * @param contractAddress The address of the customer's contract.
 * @param privateForNodes The list of addresses that can view this transaction.
 * @param ticketInfo An object containing all the information of the ticket.
 * @returns {Promise<object>} The transactions details under the "transaction" key and the ticketID under the "ticketID" key.
 */
Service.registerTicket = async (fromAddress, clientID, node, contractAddress, privateForNodes, ticketInfo) => {
  ticketInfo = Abstractors.JSONtoTicket(ticketInfo);
  const { provider, abi } = await Connection.connect(node);
  const contract = new provider.eth.Contract(abi, contractAddress);
  const transaction = await contract.methods.registerTicket(clientID,
    ticketInfo.ticketID,
    ticketInfo.terminalSerialNumber, ticketInfo.terminalRestartValue,
    ticketInfo.timestamp, ticketInfo.scaleSerialNumber,
    ticketInfo.scaleStatus, ticketInfo.scaleGross, ticketInfo.scaleNet,
    ticketInfo.cells).send({ from: fromAddress, privateFor: privateForNodes });
  return { 'transaction': transaction, 'ticketID': ticketInfo.ticketID };
};

/**
 * Updates the ticket with ticketID from the client with clientID with the provided info
 * @param fromAddress The address of the node that sends the transaction. String.
 * @param clientID The client's identifier. String.
 * @param node The node URL to connect to.
 * @param contractAddress The address of the customer's contract.
 * @param ticketID The ticket's identifier. String.
 * @param info An object with the attributes to update.
 */
Service.updateTicket = async (fromAddress, clientID, node, contractAddress, ticketID, info) => {
  throw new Error('Not Implemented.');
};

/**
 * Deletes the ticket with ticketID from the client with clientID
 * @param fromAddress The address of the node that sends the transaction. String.
 * @param clientID The client's identifier. String.
 * @param node The node URL to connect to.
 * @param contractAddress The address of the customer's contract.
 * @param privateForNodes Nodes that are allowed to see the contents of this transaction
 * @param ticketID The ticket's identifier. String.
 */
Service.deleteTicket = async (fromAddress, clientID, node, contractAddress, privateForNodes, ticketID) => {
  const { provider, abi } = await Connection.connect(node);
  const contract = new provider.eth.Contract(abi, contractAddress);
  const transaction = await contract.methods.deleteTicket(clientID, ticketID).send({
    from: fromAddress,
    privateFor: privateForNodes
  });
  return { 'transaction': transaction, 'ticketID': ticketID };
};

/**
 * Formats the timestamp in tickets to the requested dateFormat
 * @param tickets The array of tickets to transform
 * @param dateFormat The format of the dates. "simple_date", "simple_date_hour", "timestamp", "full_date"
 * @returns {Promise<array>}
 */
Service.formatDates = async (tickets, dateFormat) => {
  tickets.forEach(ticket => {
    ticket.timestamp = Abstractors.asDate(ticket.timestamp, dateFormat);
  });
  return tickets;
};