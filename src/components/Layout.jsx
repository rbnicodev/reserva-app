import "./Layout.css";

export default function Layout({ children }) {

    return (
        <div className="d-flex flex-column vh-100">
            {/* Navbar */}
            <nav
                className="navbar navbar-dark bg-dark px-3 no-print"
                style={{
                    position: "fixed",
                    top: 0,
                    width: "100vw",
                    height: "66px",
                    zIndex: 1000,
                }}
            >
                <div className="container-fluid d-flex justify-content-center align-items-center w-100">
                    <img
                        src="./aljawas-logo.svg"
                        alt="Logo Aljawas"
                        style={{ height: "50px" }}
                    />
                </div>
            </nav>

            {/* Contenido principal */}
            <main className="flex-grow-1 p-3 main-layout" style={{ paddingLeft: "0" }}>
                {children}
            </main>
        </div>
    );
}
