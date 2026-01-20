import { useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { cadastrarComEmailSenha } from "../../../servicos/firebase/authServico";
import { criarPerfilDoUsuarioSeNaoExiste } from "../../../servicos/firebase/firestoreServico";
import { Cartao } from "../../../componentes/ui/Cartao";
import { CampoTexto } from "../../../componentes/ui/CampoTexto";
import { Botao } from "../../../componentes/ui/Botao";

const Caixa = styled(Cartao)`
  width: min(420px, 100%);
  padding: 18px;
`;

const Coluna = styled.div`
  display: grid;
  gap: 10px;
`;

export default function Cadastro() {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [carregando, setCarregando] = useState(false);
    const navegar = useNavigate();

    async function criarConta(e) {
        e.preventDefault();
        setCarregando(true);

        try {
            const user = await cadastrarComEmailSenha(email, senha);

            await criarPerfilDoUsuarioSeNaoExiste({
                uid: user.uid,
                nome,
                email,
                role: "user",
                escolaId: "escola_padrao",
            });

            toast.success("Conta criada com sucesso!");
            navegar("/app");
        } catch (err) {
            console.error(err);
            toast.error("Nao foi possivel criar a conta.");
        } finally {
            setCarregando(false);
        }
    }

    return (
        <Caixa>
            <h2 style={{ margin: 0 }}>Cadastro</h2>
            <p style={{ marginTop: 6, color: "rgba(234,240,255,0.72)" }}>
                Crie sua conta para abrir chamados
            </p>

            <form onSubmit={criarConta}>
                <Coluna>
                    <CampoTexto placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
                    <CampoTexto placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <CampoTexto placeholder="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
                    <Botao $larguraTotal disabled={carregando}>
                        {carregando ? "Criando..." : "Criar conta"}
                    </Botao>
                </Coluna>
            </form>

            <p style={{ marginTop: 14, color: "rgba(234,240,255,0.72)" }}>
                Ja tem conta? <Link to="/login">Entrar</Link>
            </p>
        </Caixa>
    );
}
