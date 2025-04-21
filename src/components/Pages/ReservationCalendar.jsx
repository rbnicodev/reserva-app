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
import Header from '../Header';

export default function ReservationCalendar() {
    const navigate = useNavigate();
    useEffect(() => { window.scrollTo(0, 0); }, []);
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
            {Header(Paths.INDEX, "Reservas")}

            <div style={{ paddingTop: "90px", width: "auto" }}>
                <div className="card shadow-sm d-flex flex-column justify-content-around">
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

        </div>
    );
}
