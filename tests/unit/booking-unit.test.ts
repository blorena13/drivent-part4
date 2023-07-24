import { Booking, Room } from "@prisma/client";
import bookingRepository from "../../src/repositories/booking-repository";
import bookingService from "../../src/services/booking-service";
import { notFoundError } from "../../src/errors";

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
                    createdAt: String(new Date()),
                    updatedAt: String(new Date())
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
        it("should return an error when roomId does not exist", async () => {
            jest.spyOn(bookingRepository, "createBooking").mockResolvedValueOnce(null);


        });

        it("", async () => {

        });

        it("", async () => {

        });

    })
})