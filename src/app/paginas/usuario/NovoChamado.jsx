import { useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { CampoTexto } from "../../../componentes/ui/CampoTexto";
import { Botao } from "../../../componentes/ui/Botao";
import { useAuth } from "../../../contextos/AuthContexto";
import { criarChamado } from "../../../servicos/firebase/chamadosServico";
import { useNavigate } from "react-router-dom";
import SelectPersonalizado from "../../../componentes/ui/SelectPersonalizado";
import ModalChamadoCriado from "../../../componentes/chamados/ModalChamadoCriado";
import { usePainelPublico } from "../../../hooks/usePainelPublico";

const Caixa = styled.div`
  background: ${({ theme }) => theme.cores.fundo2};
  border: 1px solid ${({ theme }) => theme.cores.borda};
  border-radius: 8px;
  padding: 24px;
  width: 100%;
  margin: 0 auto;
`;

const Linha = styled.div`
  display: grid;
  gap: 12px;
  margin-top: 16px;
`;

const Row = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
`;

const Label = styled.label`
  display: block;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.cores.textoFraco};
  margin-bottom: 6px;
  margin-top: 10px;
`;

// Novo componente para o subtitulo com cor dinâmica
const Subtitulo = styled.p`
  margin-top: 6px;
  margin-bottom: 20px;
  color: ${({ theme }) => theme.cores.textoFraco};
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: ${({ theme }) => theme.cores.pretoTransparente};
  color: ${({ theme }) => theme.cores.texto};
  outline: none;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;

  &::placeholder {
    color: ${({ theme }) => theme.cores.textoFraco};
  }

  &:focus {
    /* Manter borda da mesma cor */
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

export default function NovoChamado() {
  const { perfil, eVisitante, uid } = useAuth();
  const navegar = useNavigate();
  const painel = usePainelPublico("escola_padrao");

  const [titulo, setTitulo] = useState("");
  const [localDoProblema, setLocalDoProblema] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [prioridade, setPrioridade] = useState("normal");
  const [descricao, setDescricao] = useState("");
  const [nomeSolicitante, setNomeSolicitante] = useState("");
  const [carregando, setCarregando] = useState(false);

  // Modal states
  const [modalAberto, setModalAberto] = useState(false);
  const [dadosModal, setDadosModal] = useState(null);

  const categorias = [
    { value: "hardware", label: "Hardware" },
    { value: "software", label: "Software" },
    { value: "rede", label: "Rede/Internet" },
    { value: "outro", label: "Outro" },
  ];
  const prioridades = [
    { value: "baixa", label: "Baixa" },
    { value: "normal", label: "Normal" },
    { value: "alta", label: "Alta" },
    { value: "urgente", label: "Urgente" },
  ];

  async function handleSubmit(e) {
    e.preventDefault();

    if (eVisitante && !nomeSolicitante.trim()) {
      return toast.error("Informe seu nome para abrir o chamado.");
    }

    if (!titulo || !localDoProblema || !categoriaId || !descricao) {
      return toast.warning("Preencha todos os campos obrigatorios!");
    }

    setCarregando(true);
    try {
      const usuarioDados = {
        uid: uid,
        nome: eVisitante ? nomeSolicitante : perfil?.nome || "Usuario",
        tipo: eVisitante ? "visitante" : perfil?.papel || "usuario",
        email: perfil?.email || null,
      };

      const novoChamado = await criarChamado({
        escolaId: "escola_padrao",
        usuario: usuarioDados,
        dadosChamado: {
          titulo,
          localDoProblema,
          categoriaId,
          prioridade,
          descricao,
          anexos: [],
        },
      });

      // Preparar dados para o modal
      setDadosModal({
        codigoChamado: novoChamado.codigoChamado,
        dataCriacao: Date.now(),
        titulo,
        descricao,
        localDoProblema,
        categoriaLabel:
          categorias.find((o) => o.value === categoriaId)?.label || categoriaId,
        prioridadeLabel:
          prioridades.find((o) => o.value === prioridade)?.label || prioridade,
        solicitante: usuarioDados.nome,
      });

      setModalAberto(true);

      // Limpar campos
      setTitulo("");
      setDescricao("");
      setLocalDoProblema("");
      setCategoriaId("");
      setPrioridade("normal");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar chamado. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Caixa>
      <h2 style={{ marginBottom: 24, marginTop: 0 }}>Novo Chamado</h2>
      <Subtitulo>
        Preencha os dados e acompanhe as atualizacoes pelo numero do chamado.
      </Subtitulo>

      <Form onSubmit={handleSubmit}>
        {eVisitante && (
          <div style={{ marginBottom: 12 }}>
            <Label>Seu Nome (Visitante)</Label>
            <CampoTexto
              placeholder="Digite seu nome para identificacao"
              value={nomeSolicitante}
              onChange={(e) => setNomeSolicitante(e.target.value)}
              required
            />
          </div>
        )}

        <Label>Titulo do Problema</Label>
        <CampoTexto
          placeholder="Ex: Projetor sala 3 nao liga"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />

        <Label>Onde esta o problema?</Label>
        <CampoTexto
          placeholder="Ex: Sala 3, Laboratorio, Secretaria..."
          value={localDoProblema}
          onChange={(e) => setLocalDoProblema(e.target.value)}
        />

        <Row>
          <div style={{ flex: 1 }}>
            <Label>Categoria</Label>
            <SelectPersonalizado
              opcoes={categorias}
              valor={categoriaId}
              onChange={setCategoriaId}
              placeholder="Selecione a categoria"
            />
          </div>
          <div style={{ width: 140 }}>
            <Label>Prioridade</Label>
            <SelectPersonalizado
              opcoes={prioridades}
              valor={prioridade}
              onChange={setPrioridade}
              placeholder="Selecione"
            />
          </div>
        </Row>

        <Label>Descricao Detalhada</Label>
        <TextArea
          rows={5}
          placeholder="Descreva o que esta acontecendo..."
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />

        <Botao type="submit" disabled={carregando} style={{ marginTop: 16 }}>
          {carregando ? "Criando..." : "Abrir Chamado"}
        </Botao>
      </Form>

      <ModalChamadoCriado
        aberto={modalAberto}
        aoFechar={() => setModalAberto(false)}
        dados={dadosModal}
        painel={painel}
      />
    </Caixa>
  );
}
