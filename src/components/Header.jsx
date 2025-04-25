import { useNavigate } from "react-router-dom"

export default function Header(path, title) {
    const navigate = useNavigate();
    return (
        <>
            <style>{`
                @media print {
                    .no-print {
                    display: none !important;
                }
                    h1 {
                        mt-0 !important;
                    }
            `}</style>
            <div style={{ width: "100vw" }}>
                <div style={{ position: "fixed", width: "100vw", height: "90px", top: "66px", backgroundColor: "white", marginLeft: "-16px", zIndex: 999 }}></div>
                {!!path ? (<button style={{ zIndex: 1001 }} className="btn btn-link position-fixed start-0 mt-4 ms-2 no-print" onClick={() => navigate(path)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="gray" className="bi bi-arrow-left" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M15 8a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 0 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 0 1 .708.708L2.707 7.5H14.5a.5.5 0 0 1 .5.5" />
                    </svg>
                </button>): <></>}
                <h1 style={{ zIndex: 1000 }} className="text-center position-fixed mt-4 w-100 start-0">{title}</h1>
            </div>
        </>
    )
}