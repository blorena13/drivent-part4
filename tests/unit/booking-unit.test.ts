import { Booking, Room } from "@prisma/client";
import bookingRepository from "../../src/repositories/booking-repository";
import bookingService from "../../src/services/booking-service";
import { notFoundError } from "../../src/errors";
import userRepository from "../../src/repositories/user-repository";
import enrollmentRepository from "../../src/repositories/enrollment-repository";
import { createEnrollmentWithAddress, createTicketTypeRemote, createUser, unitTicket } from "../factories";
import ticketsRepository from "../../src/repositories/tickets-repository";
import { createTicket } from "../../src/controllers";

describe("Booking service unit tests",() => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("get booking tests", () => {
        it("shoul return user booking with room details", async () => {
            const mockBooking: any = {
                id: 1,
                Room: {
                    id: 3,
                    name: 'Ana',
                    capacity: 3,
                    hotelId: 2,
                    createdAt: new Date,
                    updatedAt: new Date
                }
            }
            jest.spyOn(bookingRepository, "getBooking").mockResolvedValueOnce(mockBooking);
            const booking = await bookingService.getBooking(mockBooking.id);
            expect(booking).toEqual(mockBooking);
        });

        it("should return notFoundError when user booking is not found", async () => {
            jest.spyOn(bookingRepository, "getBooking").mockResolvedValueOnce(null);
            const promise = bookingService.getBooking(1);
            expect(promise).rejects.toEqual(notFoundError("Booking not found."))
        });
    });

    describe("Post booking unit test", () => {
        it("should return forbidden error when ticket is remote", async () => {
            
            jest.spyOn(enrollmentRepository, "findWithAddressByUserId").mockResolvedValue(createEnrollmentWithAddress(await createUser()));
            jest.spyOn(ticketsRepository, "findTicketByEnrollmentId").mockResolvedValue(unitTicket(false, true, false));
            const response = bookingService.createBooking(3, 2);
            await expect(response).rejects.toEqual({
                name: "ForbiddenError",
                message: "Ticket is remote"
            });
        });

        it("should return forbidden error when ticket does not includes hotel", async () => {
            jest.spyOn(enrollmentRepository, "findWithAddressByUserId").mockResolvedValue(createEnrollmentWithAddress(await createUser()));
            jest.spyOn(ticketsRepository, "findTicketByEnrollmentId").mockResolvedValue(unitTicket(false, false, true));
            const response = bookingService.createBooking(3, 2);
            await expect(response).rejects.toEqual({
                name: "ForbiddenError",
                message: "Ticket does not includes hotel"
            });
        });

        it("should return forbidden error when ticket is unpaid", async () => {
            jest.spyOn(enrollmentRepository, "findWithAddressByUserId").mockResolvedValue(createEnrollmentWithAddress(await createUser()));
            jest.spyOn(ticketsRepository, "findTicketByEnrollmentId").mockResolvedValue(unitTicket(true, false, false));
            const response = bookingService.createBooking(3, 2);
            await expect(response).rejects.toEqual({
                name: "ForbiddenError",
                message: "Ticket unpaid"
            });

        });

        it("should return forbidden error when room is full", async () => {
            jest.spyOn(userRepository, "create").mockResolvedValue(createUser())
            jest.spyOn(enrollmentRepository, "findWithAddressByUserId").mockResolvedValue(createEnrollmentWithAddress(await createUser()));
            jest.spyOn(ticketsRepository, "findTicketByEnrollmentId").mockResolvedValue(unitTicket(true, false, true));
            const mockBooking: any = {
                id: 1,
                userId: 3,
                roomId: 3
            }
            jest.spyOn(bookingRepository, "createBooking").mockResolvedValue(mockBooking);
            jest.spyOn(bookingRepository, "createBooking").mockResolvedValue(mockBooking);
            jest.spyOn(bookingRepository, "createBooking").mockResolvedValue(mockBooking);

            const response = bookingService.createBooking(3, 2);
            await expect(response).rejects.toEqual({
                name: "ForbiddenError",
                message: "room do not have capacity"
            })

        })

    })
})