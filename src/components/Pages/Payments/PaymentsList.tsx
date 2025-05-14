import type { Payment } from "../../../models/Payment";
import { Pages, type PaymentsProps } from "../Payments";

export default function PaymentsList(props: PaymentsProps) {

    const handleAdd = async (payment: Payment) => {
        props.setPayment(payment);
        props.setPage(Pages.ADD);
    }

    const handleManage = async (payment: Payment) => {
        props.setPayment(payment);
        props.setPage(Pages.EDIT);
    }

    return (
        <div>
            <h2 className="text-center" >Tus pagos gestionados</h2>
            
            <hr className="hr"></hr>
            <div className="row mt-4 mb-4">
                <button className="col btn btn-secondary mx-3" onClick={() => (props.setPayUser(null))}>Cerrar sesión</button>
                {props?.payUser?.name === 'ruben_m' ? (<button className="col btn btn-primary mx-3" onClick={() => (props.setPage(Pages.ADD))}>Añadir pago</button>) : <></>}
            </div>
            <hr className="hr"></hr>
            {
                <div className="mb-2 mt-4 h-75">
                    {props.payments.map(payment => (
                        <div className="card shadow-sm p-3 mb-4 d-flex flex-row align-items-center justify-content-between" key={payment.id}>
                            <div className="cursor-pointer flex-grow-1" onClick={() => handleManage(payment)}>
                                <h5 className="card-title text-dark text-start">{payment.name}</h5>
                                <div className="card-text text-secondary">
                                    <p>Fecha límite: {payment.deadLine}</p>
                                </div>

                                
                            </div>
                            <div>
                                    {
                                        payment.payUserCreator == props.payUser?.name
                                            ? (<button className="btn btn-sm" onClick={() => handleAdd(payment)}>
                                                ✏️
                                            </button>)
                                            : <></>
                                    }
                                </div>
                        </div>
                    ))}
                </div>
            }
        </div>
    )
}