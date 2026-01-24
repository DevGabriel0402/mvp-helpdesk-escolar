import { useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { entrarComEmailSenha } from "../../../servicos/firebase/authServico";
import { Cartao } from "../../../componentes/ui/Cartao";
import CampoComIcone from "../../../componentes/ui/CampoComIcone";
import { Botao } from "../../../componentes/ui/Botao";
import { useNavigate, Link } from "react-router-dom";
import { FaUserShield, FaEnvelope, FaLock, FaSignInAlt } from "react-icons/fa";

import { registrarPushAdmin } from "../../../servicos/firebase/pushServico";

const Caixa = styled.div`
  background: ${({ theme }) => theme.cores.fundo2};
  border: 1px solid ${({ theme }) => theme.cores.borda};
  border-radius: 8px;
  width: min(360px, 100%);
  padding: 32px;
  box-shadow: ${({ theme }) => theme.sombras.suave};
`;

const Sub = styled.p`
  margin: 6px 0 24px 0;
  color: ${({ theme }) => theme.cores.textoFraco};
`;

const Coluna = styled.div`
  display: grid;
  gap: 14px;
`;

const HeaderIcon = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 8px; /* Square look */
    background: ${({ theme }) => theme.cores.destaque};
    display: grid;
    place-items: center;
    margin-bottom: 20px;
    color: #fff;
    font-size: 1.5rem;
`;

export default function LoginAdmin() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [carregando, setCarregando] = useState(false);
    const navegar = useNavigate();

    async function fazerLogin(e) {
        e.preventDefault();
        setCarregando(true);
        try {
            await entrarComEmailSenha(email, senha);
            // ✅ tenta registrar push (não bloqueia o login)
            try {
                const r = await registrarPushAdmin({ escolaId: "escola_padrao" });
                if (!r.ok) {
                    console.log("Push não ativado:", r.motivo);
                }
            } catch (e) {
                console.log("Falha ao registrar push:", e);
            }
            toast.success("Bem-vindo, administrador!");
            navegar("/app/admin"); // Explicit admin dashboard route
        } catch (err) {
            console.error(err);
            toast.error("Nao foi possivel entrar. Verifique email e senha.");
        } finally {
            setCarregando(false);
        }
    }

    return (
        <Caixa>
            <HeaderIcon>
                <FaUserShield />
            </HeaderIcon>

            <h2 style={{ margin: 0 }}>Area Administrativa</h2>
            <Sub>Entre com suas credenciais para gerenciar.</Sub>

            <form onSubmit={fazerLogin}>
                <Coluna>
                    <CampoComIcone
                        icon={FaEnvelope}
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <CampoComIcone
                        icon={FaLock}
                        placeholder="Senha"
                        type="password"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                    />

                    <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                        <Link to="/recuperar-senha" style={{ opacity: 0.8 }}>Esqueci minha senha</Link>
                    </div>

                    <Botao $larguraTotal disabled={carregando} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        {carregando ? "Entrando..." : (
                            <>
                                <FaSignInAlt /> Entrar como Admin
                            </>
                        )}
                    </Botao>
                </Coluna>
            </form>

            <Sub style={{ marginTop: 20, textAlign: 'center' }}>
                <Link to="/">Voltar para inicio</Link>
            </Sub>
        </Caixa>
    );
}
