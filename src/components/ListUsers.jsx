import { useNavigate } from "react-router-dom"

export default function ListUsers(users, url) {

    const navigate = useNavigate();

    return (
        <div style={{height: "75vh", overflowY: "auto", overflowX: "hidden"}}>
            {users.length === 0 ? (
            <p className="text-secondary">Cargando usuarios...</p>
            ) : (
            <div className="row row-cols-2 row-cols-sm-3 g-3 w-110" style={{ maxWidth: "600px" }}>
                {users.map(user => (
                    <div className="col" key={user.id}>
                        <button
                            className="btn btn-light w-100 py-3"
                            onClick={() => navigate(`${url}?userId=${user.id}`)}
                        >
                            {user.name}
                        </button>
                    </div>
                ))}
            </div>
            )}
        </div>
    )
}