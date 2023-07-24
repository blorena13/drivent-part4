import faker from "@faker-js/faker";
import httpStatus from "http-status";
import supertest from "supertest";
import app, { init } from "@/app";
import { prisma } from "@/config";
import { cleanDb, generateValidToken } from "../helpers";
import { createBooking, createEnrollmentWithAddress, createHotel, createPayment, createRoomWithHotelId, createTicket, createTicketType, createTicketTypeRemote, createTicketTypeWithHotel, createUser, ticketWithoutHotel } from "../factories";
import { TicketStatus } from "@prisma/client";

beforeAll(async () => {
    await init();
});

beforeEach(async ()=> {
    await cleanDb();
});

const server = supertest(app);

describe('GET /booking', () => {
    it('should respond with status 401 if no token is given', async () => {
        const response = await server.get('/booking');
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();

        const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe('when token is valid', ()=> {

        it('should respond with status 404 if user do not have a booking', async () => {
          const user = await createUser();
          const token = await generateValidToken(user);
          const enrollment = await createEnrollmentWithAddress(user);
          const ticketType = await createTicketType();
          const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
          await createPayment(ticket.id, ticketType.price);
          const createdHotel = await createHotel();
          const createdRoom = await createRoomWithHotelId(createdHotel.id);

          const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
          expect(response.status).toBe(httpStatus.NOT_FOUND);
        });

        it('should responde with status 200 with booking info', async () => {
          const user = await createUser();
          const token = await generateValidToken(user);
          const enrollment = await createEnrollmentWithAddress(user);
          const ticketType = await createTicketType();
          const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
          await createPayment(ticket.id, ticketType.price);
          const createdHotel = await createHotel();
          const createdRoom = await createRoomWithHotelId(createdHotel.id);
          const createdBooking = await createBooking(enrollment.userId, createdRoom.id);

          const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
          expect(response.status).toBe(httpStatus.OK);
          expect(response.body).toEqual({
             id: createdBooking.id,
             Room: {
                id: createdRoom.id,
                name: createdRoom.name,
                capacity: createdRoom.capacity,
                hotelId: createdRoom.hotelId,
                createdAt: createdRoom.createdAt.toISOString(),
                updatedAt: createdRoom.updatedAt.toISOString()
             } 
            });
        });
    });
});

describe('POST /booking', () => {
    it('should respond with status 401 if no token is given', async () => {
        const response = await server.post('/booking');
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    
    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();
    
        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe('when token is valid', () => {

        it('should return status 403 when ticket is remote', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeRemote();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const createdHotel = await createHotel();
            const createdRoom = await createRoomWithHotelId(createdHotel.id);


            const response = await server
            .post('/booking')
            .set('Authorization', `Bearer ${token}`)
            .send({roomId: createdRoom.id});
            expect(response.status).toBe(httpStatus.FORBIDDEN);
        })

        it('should return status 403 when ticket does not include hotel', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await ticketWithoutHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            await createPayment(ticket.id, ticketType.price);
            const createdHotel = await createHotel();
            const createdRoom = await createRoomWithHotelId(createdHotel.id);


            const response = await server
            .post('/booking')
            .set('Authorization', `Bearer ${token}`)
            .send({roomId: createdRoom.id});
            expect(response.status).toBe(httpStatus.FORBIDDEN);
        })

        it('should return status 403 when ticket is unpaid', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
            const createdHotel = await createHotel();
            const createdRoom = await createRoomWithHotelId(createdHotel.id);

            const response = await server
            .post('/booking')
            .set('Authorization', `Bearer ${token}`)
            .send({roomId: createdRoom.id});
            expect(response.status).toBe(httpStatus.FORBIDDEN);
        });

        it('should return status 403 if room is full', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            await createPayment(ticket.id, ticketType.price);
            const createdHotel = await createHotel();
            const createdRoom = await createRoomWithHotelId(createdHotel.id);
            const createdBooking = await createBooking(enrollment.userId, createdRoom.id);
            const createdBooking2 = await createBooking(enrollment.userId, createdRoom.id);
            const createdBooking3 = await createBooking(enrollment.userId, createdRoom.id);
            const createdBooking4 = await createBooking(enrollment.userId, createdRoom.id);
             //pensar em um formato 

            const response = await server
            .post('/booking')
            .set('Authorization', `Bearer ${token}`)
            .send({roomId: createdRoom.id});
            expect(response.status).toBe(httpStatus.FORBIDDEN);
        
        })

        it('should return status 404 if room does not exists', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await ticketWithoutHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            await createPayment(ticket.id, ticketType.price);
            const createdHotel = await createHotel();

            const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(httpStatus.NOT_FOUND);
        });

        it('should return status 200 and bookingId', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const createdHotel = await createHotel();
            const createdRoom = await createRoomWithHotelId(createdHotel.id);

            const response = await server
            .post('/booking')
            .set('Authorization', `Bearer ${token}`)
            .send({roomId: createdRoom.id});
            expect(response.status).toBe(httpStatus.OK);
            expect(response.body).toEqual({bookingId: expect.any(Number)});
        })
    })
});


describe('UPDATE /booking/:bookingId', () => {

    it('should respond with status 401 if no token is given', async () => {
        const response = await server
        .post('/booking')
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    
    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();
    
        const response = await server
        .post('/booking')
        .set('Authorization', `Bearer ${token}`)
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe('when token is valid', () => {
        it('should return status 403 if user does not have a booking', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            await createPayment(ticket.id, ticketType.price);
            const createdHotel = await createHotel();
            const createdRoom = await createRoomWithHotelId(createdHotel.id);

            const response = await server
            .put(`/booking/`)
            .set('Authorization', `Bearer ${token}`)
            .send({roomId: createdRoom.id});
            expect(response.status).toBe(httpStatus.FORBIDDEN);
        
        })
    
        it('should return status 403 if room is full', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            await createPayment(ticket.id, ticketType.price);
            const createdHotel = await createHotel();
            const createdRoom = await createRoomWithHotelId(createdHotel.id);
            const createdBooking = await createBooking(enrollment.userId, createdRoom.id);
            const createdBooking2 = await createBooking(enrollment.userId, createdRoom.id);
            const createdBooking3 = await createBooking(enrollment.userId, createdRoom.id);
            const createdBooking4 = await createBooking(enrollment.userId, createdRoom.id);
             //pensar em um formato 

            const response = await server
            .put(`/booking/${createdBooking3.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({roomId: createdRoom.id});
            expect(response.status).toBe(httpStatus.FORBIDDEN);

        })
    
        it('should return 404 if room does not exist', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await ticketWithoutHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            await createPayment(ticket.id, ticketType.price);
            const createdHotel = await createHotel();

            const response = await server.put(`/booking`).set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(httpStatus.NOT_FOUND);
        })

        it('should return 200 with new bookingId', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            await createPayment(ticket.id, ticketType.price);
            const createdHotel = await createHotel();
            const createdRoom = await createRoomWithHotelId(createdHotel.id);
            const createdRoom2 = await createRoomWithHotelId(createdHotel.id);
            const createdBooking = await createBooking(enrollment.userId, createdRoom.id);

            const response = await server
            .put(`/booking/${createdBooking.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({roomId: createdRoom2.id});
            expect(response.status).toBe(httpStatus.OK);
        });
    });
   

    it('', async () => {
        
    })
})