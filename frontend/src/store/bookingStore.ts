import { create } from 'zustand'

interface Specialty {
    id: string
    name: string
}

interface Barber {
    id: string
    name: string
}

interface BookingState {
    specialty: Specialty | null
    barber: Barber | null
    selectedDate: Date | null

    setSpecialty: (specialty: Specialty | null) => void
    setBarber: (barber: Barber | null) => void
    setDate: (date: Date | null) => void
    reset: () => void
}

export const useBookingStore = create<BookingState>(set => ({
    specialty: null,
    barber: null,
    selectedDate: null,

    setSpecialty: specialty =>
        set({ specialty, barber: null, selectedDate: null }),
    setBarber: barber => set({ barber, selectedDate: null }),
    setDate: selectedDate => set({ selectedDate }),
    reset: () => set({ specialty: null, barber: null, selectedDate: null }),
}))
