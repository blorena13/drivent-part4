import { prisma } from "@/config";

async function getBooking(userId: number){
    return await prisma.booking.findFirst({
        where: {
            userId: userId
        },
        include: {
            Room: true,
        }
    });
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
    });
    return {
        bookingId: booking.id
    }

}

async function checkRoomCapacityLength(roomId: number){
    return await prisma.booking.findMany({
        where: {
            roomId: roomId
        }
    });
}



async function checkExistsRoom(roomId: number){
    return prisma.room.findFirst({
        where: {
            id: roomId
        }
    });
}

const bookingRepository = {
    getBooking,
    createBooking,
    updateBooking,
    checkRoomCapacityLength,
    checkExistsRoom
}

export default bookingRepository;