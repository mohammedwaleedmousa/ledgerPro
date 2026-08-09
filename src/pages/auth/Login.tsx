import AuthCard from "../../components/auth/AuthCard";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    return (
        <AuthCard
        title="تسجيل الدخول"
        description="ادخل إلى لوحة LedgerPro"
        >

        <div className="space-y-5">

            <Input
            label="البريد الإلكتروني"
            placeholder="email@example.com"
            />

            <Input
            label="كلمة المرور"
            type="password"
            placeholder="********"
            />

            <Button
                className="w-full"
                onClick={() => {
                    login();
                    navigate("/app");
                }}
                >
                دخول
            </Button>

        </div>

        </AuthCard>
    );
}