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
    useEffect(() => { window.scrollTo(0, 0); }, []);
    const [reservations, setReservations] = useState([]);
    const [users, setUsers] = useState([]);
    const [consultar, setConsultar] = useState(null);

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

            const usersCollection = collection(db, "users");
            const userDocs = await getDocs(usersCollection);
            setUsers(userDocs.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name ?? "Sin nombre"
            })));
        };
        fetchData();
    });

    const renderCustomDay = (day, _selectedDates, pickersDayProps) => {
        const handleDaySelect = (day) => {
            const sDay = new Date(day).getDate();
            const sMonth = new Date(day).getMonth();
            const sYear = new Date(day).getFullYear();
            const res = reservations.map(r => ({ ...r, reservationDate: new Date(r.reservationDate) }));
            if (null === res || res.length < 1) return;
            const sRes = res.find(r => {
                return r.reservationDate.getDate() === sDay
                    && r.reservationDate.getMonth() === sMonth
                    && r.reservationDate.getFullYear() === sYear;
            });
            const sUser = users.find(u => u.id === sRes.userId);
            if (!sUser || !sUser.name) setConsultar({
                name: sRes.userId
            });
            else setConsultar(sUser);

        }
        return isReserved(day) ? (
            <ReservedDay {...pickersDayProps} day={day.day} disabled={day.disabled} today={day.today} selected={day.selected} onDaySelect={handleDaySelect} />
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
                            slots={{ day: renderCustomDay }}
                            showDaysOutsideCurrentMonth={false}
                            readOnly
                        />
                    </LocalizationProvider>
                </div>
            </div>

            {consultar && (
                <div className="modal d-block" style={{ background: "rgba(0, 0, 0, 0.5)", marginTop: "66px" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Reservado por:</h5>
                                <button type="button" className="btn-close" onClick={() => setConsultar(null)}></button>
                            </div>
                            <div className="modal-body">
                                <p>🍻🍺 {consultar.name} 🥳🎉</p>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-primary" onClick={() => setConsultar(null)}>
                                    Aceptar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
