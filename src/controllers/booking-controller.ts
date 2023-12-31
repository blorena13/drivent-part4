import { Response } from "express";
import httpStatus from "http-status";
import { AuthenticatedRequest } from "../middlewares";
import bookingService from "../services/booking-service";
import { notFoundError } from "../errors";
import { InputBookingBody } from "../protocols";

async function getBooking(req: AuthenticatedRequest, res: Response){
    const userId = req.userId;
    try{
        const booking = await bookingService.getBooking(userId);
        return res.status(httpStatus.OK).send(booking)

    } catch(err){
        if(err.name === 'NotFoundError'){
            return res.sendStatus(httpStatus.NOT_FOUND);
        }
        return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    }
}

async function createBooking(req: AuthenticatedRequest, res: Response){
    const userId = req.userId;
    const { roomId } = req.body as InputBookingBody;

    if(!roomId){
        throw notFoundError();
    }
    
    try{
        const booking = await bookingService.createBooking(userId, roomId);
        return res.status(httpStatus.OK).send(booking);

    } catch(err){
        if(err.name === 'NotFoundError'){
            return res.sendStatus(httpStatus.NOT_FOUND)
        } else if(err.name === 'ForbiddenError'){
            return res.sendStatus(httpStatus.FORBIDDEN)
        }
        return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    }
}

async function updateBooking(req: AuthenticatedRequest, res: Response){
    const {roomId} = req.body as InputBookingBody;
    const userId = req.userId;
    const id = req.params.bookingId;

    if(!roomId){
        throw notFoundError();
    }

    try{
        const newBooking = await bookingService.updateBooking(Number(id), userId, roomId);
        return res.status(httpStatus.OK).send(newBooking);
    } catch(err){
        if(err.name === 'NotFoundError'){
            return res.sendStatus(httpStatus.NOT_FOUND)
        }else if(err.name === 'ForbiddenError'){
            return res.sendStatus(httpStatus.FORBIDDEN)
        }
        return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR)
    }
}

const bookingController = {
    getBooking,
    createBooking,
    updateBooking
}

export default bookingController;