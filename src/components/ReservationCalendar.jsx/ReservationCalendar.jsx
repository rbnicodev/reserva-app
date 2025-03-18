import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import 'dayjs/locale/es'; 
import { styled } from "@mui/material/styles";
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { Paths } from '../../utils/paths';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../../firebase';

export default function ReservationCalendar() {
    const navigate = useNavigate();
    const [reservations, setReservations] = useState([]);

    const isReserved = (date) =>
        reservations.map(r => r.reservationDate).includes(dayjs(date['data-timestamp']).format("YYYY-MM-DD"));

    const ReservedDay = styled(PickersDay)(({ theme }) => ({
        backgroundColor: theme.palette.error.light,
        color: "white",
        borderRadius: "50%",
        "&:hover": {
            backgroundColor: theme.palette.error.dark,
        },
    }));

    useEffect(() => {
        const fetchData = async () => {
            const reservationsCollection = collection(db, "reservationsDay");
            const reservationsQuery = query(reservationsCollection);
            const reservationsDocs = await getDocs(reservationsQuery);

            const sortedReservations = reservationsDocs.docs
                .map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
            setReservations(sortedReservations);
        };

        fetchData();
    });

    const renderCustomDay = (day, _selectedDates, pickersDayProps) => {
        return isReserved(day) ? (
            <ReservedDay {...pickersDayProps} day={day.day} disabled={day.disabled} today={day.today} selected={day.selected} />
        ) : (
            <PickersDay {...pickersDayProps} day={day.day} disabled={day.disabled} today={day.today} selected={day.selected} />
        );
    };

    return (
        <div>
            <button className="btn btn-link position-absolute start-0 ms-3" onClick={() => navigate(Paths.INDEX)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="gray" className="bi bi-arrow-left" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M15 8a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 0 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 0 1 .708.708L2.707 7.5H14.5a.5.5 0 0 1 .5.5" />
                </svg>
            </button>
            <h1 className="text-center">Reservas</h1>
            <div className="card shadow-sm p-3 mt-5 h-75 d-flex flex-column justify-content-around">
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                    <DateCalendar
                        disablePast={true}
                        slots={{ day: renderCustomDay }}
                        showDaysOutsideCurrentMonth={false}
                        readOnly
                    />
                </LocalizationProvider>
            </div>
        </div>
    );
}
