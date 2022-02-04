const TicketsValidator = module.exports;

/**
 * Checks if the received ticket is a null ticket, i.e., the smart contract
 * returned default values for each field, meaning that it does not exist.
 * @param ticket The ticket to check for, in smart contract representation.
 * @returns True if the ticket is null, False otherwise.
 */
TicketsValidator.isNull = ticket => {
  // At this point simply checking for the first position (ticketID) is enough.
  // If ticketID does not exist then the ticket is null.
  let ticketID = ticket[0];
  if (!ticketID) ticketID = ticket['ticketID'];
  if (ticketID === '') {
    return true;
  } else return false;
};