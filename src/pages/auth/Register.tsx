import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthCard from "../../components/auth/AuthCard";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { supabase } from "../../lib/supabase";

export default function Register() {
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);


  async function handleRegister() {

    try {

      setLoading(true);


      // 1- Create Auth User

      const { data: authData, error: authError } =
        await supabase.auth.signUp({
            email: email.trim(),
            password: password.trim(),
        });


      if (authError) {
        throw authError;
      }


      const user = authData.user;


      if (!user) {
        throw new Error("User creation failed");
      }



      // 2- Create Company

      const { data: company, error: companyError } =
        await supabase
          .from("companies")
          .insert({
            name: companyName,
            plan: "free",
          })
          .select()
          .single();


      if (companyError) {
        throw companyError;
      }



      // 3- Create Profile

      const { error: profileError } =
        await supabase
          .from("profiles")
          .insert({
            id: user.id,
            company_id: company.id,
            full_name: name,
            role: "owner",
          });


      if (profileError) {
        throw profileError;
      }


      navigate("/app");


    } catch (error) {

      console.error(error);

      alert("حدث خطأ أثناء إنشاء الحساب");

    } finally {

      setLoading(false);

    }
  }


  return (
    <AuthCard
      title="إنشاء حساب"
      description="ابدأ باستخدام LedgerPro"
    >

      <div className="space-y-5">

        <Input
          label="اسم الشركة"
          placeholder="شركة التقنية"
          onChange={(e) => setCompanyName(e.target.value)}
        />


        <Input
          label="الاسم"
          placeholder="محمد"
          onChange={(e) => setName(e.target.value)}
        />


        <Input
          label="البريد الإلكتروني"
          placeholder="email@example.com"
          onChange={(e) => setEmail(e.target.value)}
        />


        <Input
          label="كلمة المرور"
          type="password"
          placeholder="********"
          onChange={(e) => setPassword(e.target.value)}
        />


        <Button
          className="w-full"
          onClick={handleRegister}
        >
          {loading ? "جاري الإنشاء..." : "إنشاء الحساب"}
        </Button>


      </div>

    </AuthCard>
  );
}