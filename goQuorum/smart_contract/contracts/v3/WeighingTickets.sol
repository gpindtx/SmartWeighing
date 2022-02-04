pragma solidity >= 0.6;
pragma experimental ABIEncoderV2;

contract WeighingTickets {

    /* -------------- CONTRACT VARIABLES -------------- */
    // clientID to the tickets it published. address is not used to provide flexibility in change.
    mapping(string =>  Ticket[]) weighingTickets;
    mapping(string => string[]) ticketIDSPerClient;

    // The node that launched this contract.
    address owner;


    /* -------------- DATA STRUCTURES ----------------- */
    struct Ticket {
        string ticketID;
        string terminalSerialNumber;
        string terminalRestartValue;
        int timestamp;
        string scaleSerialNumber;
        string scaleStatus;
        int scaleGross;
        int scaleNet;
        LoadCellInfo loadCell1;
        LoadCellInfo loadCell2;
        LoadCellInfo loadCell3;
        LoadCellInfo loadCell4;
        LoadCellInfo loadCell5;
        LoadCellInfo loadCell6;
        LoadCellInfo loadCell7;
        LoadCellInfo loadCell8;
    }

    struct LoadCellInfo {
        string cellSerialNumber;
        int cellWeight;
    }

    /* ------------------- EVENTS -------------------- */

    event ticket_registered(string clientID, string ticketID);
    /* NOTE: Are these two events needed?
    event ticket_deleted(string clientID, string ticketID);
    event ticket_updated(string clientID, string ticketID);
    */

    /* ------------------ MODIFIERS ------------------ */



    /* ------------------ FUNCTIONS ------------------ */
    constructor() public {
        owner = msg.sender;
    }
    
    function registerTicket(
        string memory clientID,
        string memory ticketID,
        string memory terminalSerialNumber,
        string memory terminalRestartValue,
        int timestamp,
        string memory scaleSerialNumber,
        string memory scaleStatus,
        int scaleGross,
        int scaleNet,
        LoadCellInfo[8] memory cellsArray
    ) public {
        Ticket memory ticket = Ticket(
            ticketID,
            terminalSerialNumber,
            terminalRestartValue,
            timestamp,
            scaleSerialNumber,
            scaleStatus,
            scaleGross,
            scaleNet,
            cellsArray[0],
            cellsArray[1],
            cellsArray[2],
            cellsArray[3],
            cellsArray[4],
            cellsArray[5],
            cellsArray[6],
            cellsArray[7]
        );
        weighingTickets[clientID].push(ticket);
        ticketIDSPerClient[clientID].push(ticketID);
        emit ticket_registered(clientID, ticketID);
    }

    function getTicketIDS(string memory clientID) public view returns(string[] memory) {
        return ticketIDSPerClient[clientID];
    }
    
    function getTicket(string memory clientID, string memory ticketID) public view returns(Ticket memory) {
        Ticket[] memory tickets = weighingTickets[clientID];
        for(uint i = 0; i < tickets.length; i++) {
            if(stringEquals(tickets[i].ticketID, ticketID)) {
                return tickets[i];
            }
        }
    }

    function getTickets(string memory clientID) public view returns(Ticket[] memory) {
        return weighingTickets[clientID];
    }
    
    function getTicketsByString(
        string memory clientID,
        string memory value,
        string memory variable
    ) public view returns(Ticket[] memory) {
        Ticket[] memory allClientTickets = weighingTickets[clientID];
        uint sampleSize = allClientTickets.length;
        Ticket[] memory byStringTickets = new Ticket[](sampleSize);
        uint j = 0;
        for(uint i = 0; i < allClientTickets.length; i++) {
            if(stringEquals(variable, "scaleSerialNumber")) {
                if(stringEquals(allClientTickets[i].scaleSerialNumber, value)) {
                    byStringTickets[j] = allClientTickets[i];
                    j++;
                }
            } else if(stringEquals(variable, "terminalSerialNumber")) {
                if(stringEquals(allClientTickets[i].terminalSerialNumber, value)) {
                    byStringTickets[j] = allClientTickets[i];
                    j++;
                }
            } else if(stringEquals(variable, "scaleStatus")) {
                if(stringEquals(allClientTickets[i].scaleStatus, value)) {
                    byStringTickets[j] = allClientTickets[i];
                    j++;
                }
            } else if(stringEquals(variable, "terminalRestartValue")) {
                if(stringEquals(allClientTickets[i].terminalRestartValue, value)) {
                    byStringTickets[j] = allClientTickets[i];
                    j++;
                }
            }
        }
        
        return byStringTickets;
    }
    
    function getTicketsByInteger(
        string memory clientID,
        int integer,
        string memory mode,
        string memory variable
    ) public view returns(Ticket[] memory) {
        Ticket[] memory allClientTickets = weighingTickets[clientID];
        uint sampleSize = allClientTickets.length;
        Ticket[] memory byIntegerTickets = new Ticket[](sampleSize);
        uint j=0;
        for(uint i = 0; i < allClientTickets.length; i++) {
            if(stringEquals(mode, "above")) {
                if(stringEquals(variable, "weight")) {
                    if(allClientTickets[i].scaleGross >= integer) {
                        byIntegerTickets[j] = allClientTickets[i];
                        j++;
                    }
                } else if(stringEquals(variable, "date")) {
                    if(allClientTickets[i].timestamp >= integer) {
                        byIntegerTickets[j] = allClientTickets[i];
                        j++;
                    }
                }
            } else if(stringEquals(mode, "below")) {
                if(stringEquals(variable, "weight")) {
                    if(allClientTickets[i].scaleGross < integer) {
                        byIntegerTickets[j] = allClientTickets[i];
                        j++;
                    }
                } else if(stringEquals(variable, "date")) {
                    if(allClientTickets[i].timestamp < integer) {
                        byIntegerTickets[j] = allClientTickets[i];
                        j++;
                    }
                }
            }
        }

        return byIntegerTickets;
    }
    
    function getTicketsByInterval(
        string memory clientID,
        int lowerLimit,
        int upperLimit,
        string memory variable
    ) public view returns(Ticket[] memory) {
        Ticket[] memory allClientTickets = weighingTickets[clientID];
        uint sampleSize = allClientTickets.length;
        Ticket[] memory byIntervalTickets = new Ticket[](sampleSize);
        uint j=0;
        for(uint i = 0; i < allClientTickets.length; i++) {
            if(stringEquals(variable, "weight")) {
                int targetWeight = allClientTickets[i].scaleGross;
                if(targetWeight >= lowerLimit && targetWeight < upperLimit) {
                    byIntervalTickets[j] = allClientTickets[i];
                    j++;
                }
            } else if(stringEquals(variable, "date")) {
                int targetTimestamp = allClientTickets[i].timestamp;
                if(targetTimestamp >= lowerLimit && targetTimestamp < upperLimit) {
                    byIntervalTickets[j] = allClientTickets[i];
                    j++;
                }
            }
        }
        
        return byIntervalTickets;
    }
    
    function deleteTicket(string memory clientID, string memory ticketID) public {
        bool found = false;
        for(uint i = 0; i < weighingTickets[clientID].length; i++) {
            if(stringEquals(weighingTickets[clientID][i].ticketID, ticketID)) {
                found = true;
            }

            if(found && i <= weighingTickets[clientID].length - 2) {
                weighingTickets[clientID][i] = weighingTickets[clientID][i+1];
            }
        }
        delete weighingTickets[clientID][weighingTickets[clientID].length-1];
    }
    

    function stringEquals(string memory firstString, string memory secondString) private pure returns(bool) {
        return keccak256(abi.encodePacked(firstString)) == keccak256(abi.encodePacked(secondString));
    }
    
}