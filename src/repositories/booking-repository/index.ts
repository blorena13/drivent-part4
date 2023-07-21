import { prisma } from "@/config";

async function getBooking(id: number){
    const booking = await prisma.booking.findFirst({
        where: {
            userId: id
        },
        include: {
            Room: true,
        }
    });

    return {
        id: booking.id,
        Room: { 
            id: booking.Room.id,
            name: booking.Room.name,
            capacity: booking.Room.capacity,
            hotelId: booking.Room.hotelId,
            createdAt: booking.Room.createdAt.toISOString(),
            updatedAt: booking.Room.updatedAt.toISOString()
        }
    }

}

async function findUserToCreateBooking(userId: number){
    return await prisma.ticket.findFirst({
        where: {
            status: 'PAID',
            Enrollment: {
                userId: userId
            },
            TicketType: {
                isRemote: false,
                includesHotel: true
            }
        },
        include:{
            Enrollment: true,
            TicketType: true
        }
    })
}

async function createBooking(userId: number, roomId: number){
    const booking = await prisma.booking.create({
        data: {
            userId: userId,
            roomId: roomId,
        }
    });

    return {
        bookingId: booking.id
    }
}

async function updateBooking(id: number, userId: number, roomId: number){
    const booking = await prisma.booking.update({
        where: {
            id: id
        },
        data: {
            userId: userId,
            roomId: roomId,
        }
    })

}

const bookingRepository = {
    getBooking,
    createBooking,
    updateBooking,
    findUserToCreateBooking
}

export default bookingRepository;