import { useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { recuperarSenha } from "../../../servicos/firebase/authServico";
import { Cartao } from "../../../componentes/ui/Cartao";
import CampoComIcone from "../../../componentes/ui/CampoComIcone";
import { Botao } from "../../../componentes/ui/Botao";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";

const Caixa = styled(Cartao)`
  width: min(420px, 100%);
  padding: 18px;
`;

const Sub = styled.p`
  margin: 6px 0 16px 0;
  color: ${({ theme }) => theme.cores.textoFraco};
`;

const Coluna = styled.div`
  display: grid;
  gap: 10px;
`;

export default function RecuperarSenha() {
    const [email, setEmail] = useState("");
    const [carregando, setCarregando] = useState(false);
    const navegar = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        if (!email) return toast.warning("Digite seu email.");

        setCarregando(true);
        try {
            await recuperarSenha(email);
            toast.success("Email de recuperacao enviado! Verifique sua caixa de entrada.");
            navegar("/login-admin");
        } catch (err) {
            console.error(err);
            toast.error("Erro ao enviar email. Verifique se o endereco esta correto.");
        } finally {
            setCarregando(false);
        }
    }

    return (
        <Caixa>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: '50%' }}>
                    <FaLock size={20} />
                </div>
                <h2 style={{ margin: 0 }}>Recuperar Senha</h2>
            </div>

            <Sub>Insira seu email para receber um link de redefinicao.</Sub>

            <form onSubmit={handleSubmit}>
                <Coluna>
                    <CampoComIcone
                        icon={FaEnvelope}
                        placeholder="Seu email de administrador"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <Botao $larguraTotal disabled={carregando}>
                        {carregando ? "Enviando..." : "Enviar Email"}
                    </Botao>
                </Coluna>
            </form>

            <Sub style={{ marginTop: 14 }}>
                <Link to="/login-admin">Voltar para Login</Link>
            </Sub>
        </Caixa>
    );
}
