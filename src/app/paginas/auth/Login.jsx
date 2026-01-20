import { useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { entrarComEmailSenha } from "../../../servicos/firebase/authServico";
import { Cartao } from "../../../componentes/ui/Cartao";
import { CampoTexto } from "../../../componentes/ui/CampoTexto";
import { Botao } from "../../../componentes/ui/Botao";
import { Link, useNavigate } from "react-router-dom";

const Caixa = styled(Cartao)`
  width: min(420px, 100%);
  padding: 18px;
`;

const Titulo = styled.h2`
  margin: 0 0 6px 0;
`;

const Sub = styled.p`
  margin: 0 0 16px 0;
  color: ${({ theme }) => theme.cores.textoFraco};
`;

const Coluna = styled.div`
  display: grid;
  gap: 10px;
`;

export default function Login() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [carregando, setCarregando] = useState(false);
    const navegar = useNavigate();

    async function fazerLogin(e) {
        e.preventDefault();
        setCarregando(true);
        try {
            await entrarComEmailSenha(email, senha);
            toast.success("Bem-vindo!");
            navegar("/app");
        } catch (err) {
            console.error(err);
            toast.error("Nao foi possivel entrar. Verifique email e senha.");
        } finally {
            setCarregando(false);
        }
    }

    return (
        <Caixa>
            <Titulo>Entrar</Titulo>
            <Sub>Acesse o Helpdesk da escola</Sub>

            <form onSubmit={fazerLogin}>
                <Coluna>
                    <CampoTexto
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <CampoTexto
                        placeholder="Senha"
                        type="password"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                    />
                    <Botao $larguraTotal disabled={carregando}>
                        {carregando ? "Entrando..." : "Entrar"}
                    </Botao>
                </Coluna>
            </form>

            <Sub style={{ marginTop: 14 }}>
                Nao tem conta? <Link to="/cadastro">Criar agora</Link>
            </Sub>
        </Caixa>
    );
}
