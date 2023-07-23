import { forbiddenError, notFoundError } from "../../errors";
import bookingRepository from "../../repositories/booking-repository";
import enrollmentRepository from "../../repositories/enrollment-repository";
import ticketsRepository from "../../repositories/tickets-repository";

async function getBooking(userId: number){
    const booking = await bookingRepository.getBooking(userId);
    if(!booking){
       throw notFoundError();
    }
    return booking;
}

async function createBooking(userId: number,roomId: number){

    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    const existsTicket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
    const checkRoom = await bookingRepository.checkRoomCapacityLength(roomId);
    const checkBooking = await bookingRepository.getBooking(userId);

    if(!existsTicket || existsTicket.status === 'RESERVED' || existsTicket.TicketType.isRemote || !existsTicket.TicketType.includesHotel || checkRoom.length >= checkBooking.Room.capacity){
        throw forbiddenError();
    }


    const booking = await bookingRepository.createBooking(userId, roomId);
    return booking;
}

async function updateBooking(id: number, userId: number, roomId: number){
    const checkRoom = await bookingRepository.checkRoomCapacityLength(roomId);
    const checkBooking = await bookingRepository.getBooking(userId);
    if(!checkBooking || checkRoom.length > checkBooking.Room.capacity){
        throw forbiddenError();
    }

    const booking = await bookingRepository.updateBooking(id, userId, roomId);
    return booking;
}

const bookingService = {
    getBooking,
    createBooking,
    updateBooking
}

export default bookingService;