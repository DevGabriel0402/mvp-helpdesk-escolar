import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled, { useTheme } from "styled-components";
import { toast } from "react-toastify";
import {
  FaRegStickyNote,
  FaExchangeAlt,
  FaCheckCircle,
  FaCheck,
  FaExclamationCircle,
  FaPlayCircle,
  FaPlusCircle,
  FaTrashAlt,
  FaMapMarkerAlt,
  FaUser,
  FaRegCalendarAlt,
  FaCommentDots,
  FaArrowLeft,
  FaExternalLinkAlt,
  FaFlag,
  FaSave,
  FaFilePdf,
} from "react-icons/fa";
import { Cartao } from "../../../componentes/ui/Cartao";
import {
  ouvirComentarios,
  ouvirAtualizacoes,
  adicionarAtualizacaoAdmin,
  alterarStatusChamadoAdmin,
  alterarPrioridadeChamadoAdmin,
  confirmarPrioridadeEReceberChamado,
  excluirChamadoAdmin,
  ouvirChamado,
  buscarChamadoPorId,
} from "../../../servicos/firebase/chamadosServico";
import { useAuth } from "../../../contextos/AuthContexto";
import { usePainelPublico } from "../../../hooks/usePainelPublico";
import { gerarPdfChamado } from "../../../utils/gerarPdfChamado";
import SelectPersonalizado from "../../../componentes/ui/SelectPersonalizado";
import Modal from "../../../componentes/ui/Modal";
import { CampoTexto } from "../../../componentes/ui/CampoTexto";
import { Botao } from "../../../componentes/ui/Botao";

const Grid = styled.div`
  display: flex;
  flex-direction: column-reverse;
  gap: 16px;
  max-width: 100%;

  @media (min-width: 980px) {
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
  }
`;

const Caixa = styled.div`
  background: ${({ theme }) => theme.cores.fundo2};
  border: 1px solid ${({ theme }) => theme.cores.borda};
  border-radius: 8px;
  padding: 20px 24px;
`;

const CabecalhoChamado = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
`;

const BotaoVoltar = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.cores.textoFraco};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 50%;
  margin-right: -4px;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.cores.borda};
    color: ${({ theme }) => theme.cores.texto};
  }
`;

const BotaoAcaoHeader = styled.button`
  background: ${({ theme }) => theme.cores.vidroForte};
  border: 1px solid ${({ theme }) => theme.cores.borda};
  color: ${({ theme }) => theme.cores.texto};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s;
  margin-left: auto;

  &:hover {
    background: ${({ theme }) => theme.cores.destaque};
    border-color: ${({ theme }) => theme.cores.destaque};
    color: white;
  }

  @media (max-width: 600px) {
    width: 100%;
    margin-left: 0;
    order: 10;
  }
`;

const CodigoChamado = styled.span`
  font-family: monospace;
  font-weight: 700;
  color: ${({ theme }) => theme.cores.destaque};
  font-size: 1rem;
`;

const StatusBadge = styled.span`
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: capitalize;

  background: ${({ $status }) => {
    switch ($status) {
      case "aberto":
        return "rgba(50, 200, 255, 0.15)";
      case "andamento":
        return "rgba(255, 200, 50, 0.15)";
      case "prodabel":
        return "rgba(155, 89, 182, 0.15)"; // Purple
      case "resolvido":
        return "rgba(50, 255, 100, 0.15)"; // Green
      default:
        return "rgba(255, 255, 255, 0.1)";
    }
  }};

  color: ${({ $status }) => {
    switch ($status) {
      case "aberto":
        return "#32c8ff";
      case "andamento":
        return "#ffc832";
      case "prodabel":
        return "#9b59b6"; // Purple
      case "resolvido":
        return "#32ff64"; // Green
      default:
        return "#ccc";
    }
  }};
`;

const PrioridadeBadge = styled.span`
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: capitalize;

  background: ${({ $prio }) => {
    switch ($prio) {
      case "alta":
        return "rgba(249, 115, 22, 0.15)";
      case "normal":
        return "rgba(16, 185, 129, 0.15)";
      case "baixa":
        return "rgba(50, 200, 255, 0.15)";
      case "urgente":
        return "rgba(255, 77, 77, 0.15)";
      default:
        return "rgba(255, 255, 255, 0.1)";
    }
  }};

  color: ${({ $prio }) => {
    switch ($prio) {
      case "alta":
        return "#f97316";
      case "normal":
        return "#10b981";
      case "baixa":
        return "#32c8ff";
      case "urgente":
        return "#ff4d4d";
      default:
        return "#ccc";
    }
  }};
`;

const Titulo = styled.h2`
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  font-weight: 600;
`;

const InfoMeta = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.cores.textoFraco};
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
`;

const Descricao = styled.p`
  margin: 16px 0 0 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.cores.texto};
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.cores.borda};
`;

const SecaoTitulo = styled.h3`
  margin: 0 0 16px 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ theme }) => theme.cores.textoFraco};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Lista = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: ${({ theme }) => theme.cores.borda};
  border-radius: 8px;
`;

const Item = styled.div`
  padding: 14px 16px;
  background: ${({ theme }) => theme.cores.fundo2};
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const ModalBox = styled.div`
  background: ${({ theme }) => theme.cores.fundo};
  border: 1px solid ${({ theme }) => theme.cores.borda};
  border-radius: 16px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
`;

const InputExcluir = styled.input`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 77, 77, 0.4);
  background: rgba(255, 77, 77, 0.1);
  color: #ff4d4d;
  font-size: 1rem;
  margin-bottom: 16px;
  box-sizing: border-box;
  outline: none;

  &::placeholder {
    color: rgba(255, 77, 77, 0.6);
  }

  &:focus {
    border-color: #ff4d4d;
    box-shadow: 0 0 0 2px rgba(255, 77, 77, 0.2);
  }
`;

function formatarData(valor) {
  if (!valor) return "";
  const d = valor.toDate ? valor.toDate() : new Date(valor);
  return d.toLocaleString("pt-BR");
}

function pegarMillis(data) {
  if (!data) return 0;
  if (typeof data.toMillis === "function") return data.toMillis();
  return 0;
}

// Componente inline para definir prioridade no item "Chamado Criado"
function DefinirPrioridadeInline({
  chamadoId,
  adminUid,
  adminNome,
  prioridadeAtual,
  onDefinida,
}) {
  const [prioridade, setPrioridade] = useState(prioridadeAtual || "");
  const [salvando, setSalvando] = useState(false);
  const [definida, setDefinida] = useState(!!prioridadeAtual);

  async function salvar() {
    if (!prioridade) {
      toast.warning("Selecione uma prioridade antes de confirmar.");
      return;
    }
    setSalvando(true);
    try {
      await confirmarPrioridadeEReceberChamado({
        chamadoId,
        novaPrioridade: prioridade,
        adminUid,
        adminNome,
      });
      toast.success("Prioridade definida e chamado recebido!");
      setDefinida(true);
      if (onDefinida) onDefinida(prioridade);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao definir prioridade.");
    } finally {
      setSalvando(false);
    }
  }

  if (definida) {
    const cores = { baixa: "#32c8ff", normal: "#10b981", alta: "#f97316", urgente: "#ff4d4d" };
    const cor = cores[prioridade?.toLowerCase()] || "#10b981";

    return (
      <div
        style={{
          marginTop: 8,
          fontSize: "0.85rem",
          color: cor,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <FaCheckCircle /> Prioridade: <strong>{prioridade}</strong>
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: 8,
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
      }}
    >
      <div style={{ width: 160 }}>
        <SelectPersonalizado
          valor={prioridade}
          onChange={setPrioridade}
          placeholder="Selecione"
          direcao="cima"
          opcoes={[
            {
              value: "baixa",
              label: "Baixa",
              icone: <FaFlag color="#64748b" />,
            },
            {
              value: "normal",
              label: "Normal",
              icone: <FaFlag color="#10b981" />,
            },
            {
              value: "alta",
              label: "Alta",
              icone: <FaFlag color="#f97316" />,
            },
            {
              value: "urgente",
              label: "Urgente",
              icone: <FaFlag color="#ff4d4d" />,
            },
          ]}
        />
      </div>
      <button
        onClick={salvar}
        disabled={salvando}
        style={{
          padding: "6px 12px",
          borderRadius: 8,
          border: "1px solid rgba(50, 255, 100, 0.3)",
          background: "rgba(50, 255, 100, 0.1)",
          color: "#32ff64",
          fontSize: "0.85rem",
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <FaCheck /> {salvando ? "..." : "Confirmar"}
      </button>
    </div>
  );
}

const BotaoNota = styled.button`
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  color: ${({ theme }) => theme.cores.texto};
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.cores.borda};
    color: ${({ theme }) => theme.cores.fundo};
  }
`;

function AcoesAdminChamado({ chamadoId, adminUid, adminNome, statusAtual, statusSugerido, limparSugerido }) {
  const theme = useTheme();
  const [status, setStatus] = useState(statusAtual || "aberto");
  const [nota, setNota] = useState("");
  // Trava local para evitar retrocesso e oscilação por latência do banco
  const [statusMinimo, setStatusMinimo] = useState(statusAtual || "aberto");

  // Modal Prodabel
  const [modalProdabelAberto, setModalProdabelAberto] = useState(false);
  const [numeroChamadoProdabel, setNumeroChamadoProdabel] = useState("");
  const [enviandoProdabel, setEnviandoProdabel] = useState(false);

  const hierarquia = {
    aberto: 0,
    andamento: 1,
    prodabel: 2,
    resolvido: 3,
  };

  // Sincronização inicial e com mudanças no banco
  useEffect(() => {
    if (statusAtual) {
      // Atualiza o bloqueio se o banco estiver mais avançado
      if (hierarquia[statusAtual] > hierarquia[statusMinimo]) {
        setStatusMinimo(statusAtual);
      }

      // Segue o banco se não houver sugestão ativa e o banco for superior ao local
      if (!statusSugerido && hierarquia[statusAtual] > hierarquia[status]) {
        setStatus(statusAtual);
      }
    }
  }, [statusAtual, statusSugerido, status, statusMinimo]);

  // Reagir a sugestões externas (ex: Confirmar Prioridade)
  useEffect(() => {
    if (statusSugerido) {
      setStatus(statusSugerido);
      if (hierarquia[statusSugerido] > hierarquia[statusMinimo]) {
        setStatusMinimo(statusSugerido);
      }
      const timer = setTimeout(() => limparSugerido?.(), 500);
      return () => clearTimeout(timer);
    }
  }, [statusSugerido, limparSugerido, statusMinimo]);

  async function salvarNota() {
    try {
      if (!nota.trim()) return toast.info("Escreva uma nota.");
      await adicionarAtualizacaoAdmin({
        chamadoId,
        tipo: "nota",
        texto: nota.trim(),
        adminUid,
        adminNome,
      });
      setNota("");
      toast.success("Nota adicionada.");
    } catch (e) {
      console.error(e);
      toast.error("Nao foi possivel salvar a nota.");
    }
  }

  async function mudarStatus() {
    try {
      // Se for encaminhamento para Prodabel, abre o modal em vez de salvar direto
      if (status === "prodabel") {
        setModalProdabelAberto(true);
        return;
      }

      await alterarStatusChamadoAdmin({
        chamadoId,
        novoStatus: status,
        adminUid,
        adminNome,
      });
      toast.success("Status atualizado.");
      setStatusMinimo(status); // Bloqueia retrocesso imediatamente
      setNota("");
    } catch (e) {
      console.error(e);
      toast.error("Nao foi possivel mudar o status.");
    }
  }

  async function confirmarEncaminhamentoProdabel() {
    if (!numeroChamadoProdabel.trim()) {
      toast.error("Informe o número do chamado da Prodabel.");
      return;
    }

    setEnviandoProdabel(true);
    try {
      const textoPersonalizado = `N° do chamado: ${numeroChamadoProdabel.trim()}`;

      await alterarStatusChamadoAdmin({
        chamadoId,
        novoStatus: "prodabel",
        adminUid,
        adminNome,
        texto: textoPersonalizado,
      });

      toast.success("Encaminhado para Prodabel com sucesso!");
      setStatusMinimo("prodabel"); // Bloqueia retrocesso imediatamente
      setModalProdabelAberto(false);
      setNumeroChamadoProdabel("");
      setNota("");
    } catch (e) {
      console.error(e);
      toast.error("Erro ao encaminhar para Prodabel.");
    } finally {
      setEnviandoProdabel(false);
    }
  }

  async function finalizar() {
    try {
      if (!window.confirm("Deseja realmente finalizar o chamado?")) return;

      // Bloqueio imediato local para UI
      setStatusMinimo("resolvido");

      await alterarStatusChamadoAdmin({
        chamadoId,
        novoStatus: "resolvido",
        adminUid,
        adminNome,
      });
      toast.success("Chamado finalizado (resolvido).");
      setNota("");
      setStatus("resolvido");
    } catch (e) {
      console.error(e);
      toast.error("Nao foi possivel finalizar.");
    }
  }

  return (
    <div
      style={{
        marginTop: 14,
        padding: 16,
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        background: theme.nome === "claro" ? "rgba(0,0,0,0.02)" : "rgba(255,255,255,0.02)",
      }}
    >
      {/* Linha de Status */}
      <label style={{ fontSize: "0.8rem", fontWeight: 600, opacity: 0.6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        Status do Chamado
      </label>
      <div style={{ marginTop: 8, display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <SelectPersonalizado
            valor={status}
            onChange={(val) => setStatus(val)}
            opcoes={[
              {
                value: "aberto",
                label: "Recebido",
                icone: <FaExclamationCircle color="#32c8ff" />,
                disabled: hierarquia["aberto"] <= Math.max(hierarquia[statusAtual], hierarquia[statusMinimo]),
              },
              {
                value: "andamento",
                label: "Em andamento",
                icone: <FaPlayCircle color="#ffc832" />,
                disabled: hierarquia["andamento"] <= Math.max(hierarquia[statusAtual], hierarquia[statusMinimo]),
              },
              {
                value: "prodabel",
                label: "Encaminha para Prodabel",
                icone: <FaExternalLinkAlt color="#9b59b6" />,
                disabled: hierarquia["prodabel"] <= Math.max(hierarquia[statusAtual], hierarquia[statusMinimo]),
              },
              ...(status === "resolvido" ? [{
                value: "resolvido",
                label: "Resolvido",
                icone: <FaCheckCircle color="#32ff64" />,
                disabled: true,
              }] : []),
            ]}
            placeholder="Selecione o status"
          />
        </div>
        <button
          onClick={mudarStatus}
          disabled={status === statusAtual}
          title="Salvar Status"
          style={{
            width: 46,
            height: 46,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: status === statusAtual ? "not-allowed" : "pointer",
            background: "rgba(50, 200, 255, 0.15)",
            border: "1px solid rgba(50, 200, 255, 0.3)",
            color: "#32c8ff",
            transition: "all 0.2s",
            opacity: status === statusAtual ? 0.4 : 1,
          }}
          onMouseOver={(e) => {
            if (status !== statusAtual) e.currentTarget.style.background = "rgba(50, 200, 255, 0.25)";
          }}
          onMouseOut={(e) => {
            if (status !== statusAtual) e.currentTarget.style.background = "rgba(50, 200, 255, 0.15)";
          }}
        >
          <FaSave size={18} />
        </button>
      </div>

      {/* Bloco de Notas */}
      <label
        style={{ display: "block", marginTop: 20, fontSize: "0.8rem", fontWeight: 600, opacity: 0.6, textTransform: 'uppercase', letterSpacing: 0.5 }}
      >
        Nova Atualização / Nota
      </label>
      <textarea
        value={nota}
        onChange={(e) => setNota(e.target.value)}
        rows={3}
        placeholder="Escreva uma nota ou atualização..."
        style={{
          width: "100%",
          marginTop: 8,
          borderRadius: 14,
          padding: 12,
          background: theme.nome === "claro" ? "#fff" : "rgba(0,0,0,0.2)",
          color: "inherit",
          border: "1px solid rgba(128,128,128,0.15)",
          fontFamily: "inherit",
          resize: "none",
          height: "90px",
          outline: "none",
          fontSize: '0.9rem'
        }}
      />
      <BotaoNota
        onClick={salvarNota}
        style={{
          marginTop: 10,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8
        }}
      >
        <FaPlusCircle /> Adicionar Nota
      </BotaoNota>

      {/* Botões de Ação Final */}
      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={finalizar}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 12,
            cursor: "pointer",
            fontWeight: 600,
            background: "#32ff64",
            border: "none",
            color: "#000",
            transition: "all 0.2s",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#2cf05d")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#32ff64")}
        >
          <FaCheckCircle /> Finalizar Chamado
        </button>
      </div>

      <Modal
        aberto={modalProdabelAberto}
        aoFechar={() => !enviandoProdabel && setModalProdabelAberto(false)}
        titulo="Encaminhar para Prodabel"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "10px 0" }}>
          <p style={{ margin: 0, fontSize: "0.95rem", opacity: 0.8 }}>
            Informe o número do chamado gerado no sistema da Prodabel para este atendimento.
          </p>

          <CampoTexto
            label="Número do Chamado (Prodabel)"
            value={numeroChamadoProdabel}
            onChange={(e) => setNumeroChamadoProdabel(e.target.value.replace(/\D/g, ''))}
            placeholder="Ex: 123456"
            autoFocus
          />

          <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
            <Botao
              $variant="secundario"
              onClick={() => setModalProdabelAberto(false)}
              disabled={enviandoProdabel}
              style={{ flex: 1 }}
            >
              Cancelar
            </Botao>
            <Botao
              onClick={confirmarEncaminhamentoProdabel}
              carregando={enviandoProdabel}
              style={{ flex: 1 }}
            >
              Confirmar
            </Botao>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function DetalhesDoChamado() {
  const { id } = useParams();
  const navegar = useNavigate();
  const { perfil, eAdmin, uid } = useAuth();
  const painel = usePainelPublico(perfil?.escolaId || "escola_padrao");

  const [chamado, setChamado] = useState(null);
  const [atualizacoes, setAtualizacoes] = useState([]);
  const [comentarios, setComentarios] = useState([]);
  const [statusSugerido, setStatusSugerido] = useState(null);

  // Modal de exclusão
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [confirmacaoExcluir, setConfirmacaoExcluir] = useState("");
  const [excluindo, setExcluindo] = useState(false);

  async function handleExcluir() {
    if (confirmacaoExcluir.toLowerCase() !== "excluir") {
      toast.error("Digite 'excluir' para confirmar.");
      return;
    }

    setExcluindo(true);
    try {
      await excluirChamadoAdmin(id);
      toast.success("Chamado excluído com sucesso!");
      navegar("/app");
    } catch (e) {
      console.error(e);
      toast.error("Erro ao excluir chamado.");
    } finally {
      setExcluindo(false);
      setModalExcluirAberto(false);
    }
  }

  // Buscar dados do chamado em tempo real
  useEffect(() => {
    if (!id) return;

    const unsub = ouvirChamado(id, (res) => {
      setChamado(res);
    });

    return () => unsub?.();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const off1 = ouvirAtualizacoes(id, setAtualizacoes);
    const off2 = ouvirComentarios(id, setComentarios);

    return () => {
      off1?.();
      off2?.();
    };
  }, [id]);

  const timeline = useMemo(() => {
    const tudo = [...comentarios, ...atualizacoes];

    // Injetar evento de criacao se tivermos o chamado
    if (chamado && chamado.criadoEm) {
      tudo.push({
        id: "inicio",
        _tipoItem: "atualizacao",
        tipo: "criacao",
        texto: "",
        adminNome: chamado.criadoPorNome || "Sistema",
        criadoEm: chamado.criadoEm,
      });
    }

    tudo.sort((a, b) => pegarMillis(a.criadoEm) - pegarMillis(b.criadoEm));
    return tudo;
  }, [comentarios, atualizacoes, chamado]);

  // Precisamos do status atual para o componente Admin.
  // Vamos tentar pegar da ultima atualização de status na timeline?
  // Ou melhor, vamos pegar do ultimo item timeline?
  // Nao, o ideal é o status real.
  // Hack rapido: Se tivermos o objeto chamado via props seria otimo.
  // Vamos adicionar um "buscarChamadoPeloId" no servico ou apenas fetch aqui.
  // Mas o usuario disse "suas rules atuais permitem admin atualizar".

  // Vou adicionar status=aberto como fallback ou pegar da ultima mudanca de status na timeline.
  const ultimoStatus = useMemo(() => {
    if (chamado?.status) return chamado.status;

    // Fallback: procurar no histórico (timeline) se o documento ainda não carregou
    for (let i = timeline.length - 1; i >= 0; i--) {
      if (timeline[i].tipo === "mudanca_status") {
        return timeline[i].para;
      }
    }
    return "aberto";
  }, [chamado, timeline]);

  return (
    <Grid>
      <Caixa>
        {/* Cabeçalho do Chamado */}
        <CabecalhoChamado>
          <BotaoVoltar onClick={() => navegar("/app/admin")} title="Voltar">
            <FaArrowLeft />
          </BotaoVoltar>
          <CodigoChamado>
            {chamado?.codigoChamado || `#${chamado?.numeroChamado || id}`}
          </CodigoChamado>
          <StatusBadge $status={ultimoStatus}>
            {ultimoStatus === "andamento"
              ? "Em Progresso"
              : ultimoStatus === "aberto"
                ? "Recebido"
                : ultimoStatus === "prodabel"
                  ? "Encaminha para Prodabel"
                  : ultimoStatus === "resolvido"
                    ? "Chamado Finalizado"
                    : ultimoStatus}
          </StatusBadge>
          <PrioridadeBadge $prio={chamado?.prioridade}>
            {chamado?.prioridade || "-"}
          </PrioridadeBadge>

          <BotaoAcaoHeader
            onClick={() => gerarPdfChamado({ chamado, painel, atualizacoes, comentarios })}
            title="Imprimir PDF"
          >
            <FaFilePdf />
            Imprimir
          </BotaoAcaoHeader>
        </CabecalhoChamado>

        <Titulo>{chamado?.titulo || "Carregando..."}</Titulo>

        <InfoMeta>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <FaMapMarkerAlt /> {chamado?.localDoProblema || "Local não definido"}
          </span>
          <span>•</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <FaUser /> {chamado?.criadoPorNome || "Anônimo"}
          </span>
          <span>•</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <FaRegCalendarAlt /> {formatarData(chamado?.criadoEm)}
          </span>
        </InfoMeta>

        {chamado?.descricao && <Descricao>{chamado.descricao}</Descricao>}

        {/* Timeline */}
        <SecaoTitulo style={{ marginTop: 24 }}>Histórico</SecaoTitulo>
        <Lista>
          {timeline.length === 0 ? (
            <Item style={{ textAlign: "center", opacity: 0.5 }}>
              Nenhuma atividade registrada.
            </Item>
          ) : (
            timeline.map((item) => {
              if (item._tipoItem === "atualizacao") {
                return (
                  <Item key={item.id} style={{ display: "flex", gap: 16 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: (() => {
                          if (item.tipo === "criacao") return "rgba(50, 200, 255, 0.1)";
                          if (item.tipo === "nota") return "rgba(255, 200, 50, 0.1)";
                          if (item.tipo === "mudanca_prioridade") {
                            if (item.para === "urgente") return "rgba(255, 77, 77, 0.1)";
                            if (item.para === "alta") return "rgba(249, 115, 22, 0.1)";
                            return "rgba(255, 165, 0, 0.1)";
                          }
                          switch (item.para) {
                            case "prodabel":
                              return "rgba(155, 89, 182, 0.1)";
                            case "resolvido":
                              return "rgba(50, 255, 100, 0.1)";
                            case "andamento":
                              return "rgba(255, 200, 50, 0.1)";
                            default:
                              return "rgba(50, 200, 255, 0.1)";
                          }
                        })(),
                        color: (() => {
                          if (item.tipo === "criacao") return "#32c8ff";
                          if (item.tipo === "nota") return "#ffc832";
                          if (item.tipo === "mudanca_prioridade") {
                            if (item.para === "urgente") return "#ff4d4d";
                            if (item.para === "alta") return "#f97316";
                            return "#ffa500";
                          }
                          switch (item.para) {
                            case "prodabel":
                              return "#9b59b6";
                            case "resolvido":
                              return "#32ff64";
                            case "andamento":
                              return "#ffc832";
                            case "urgente":
                              return "#ff4d4d";
                            default:
                              return "#32c8ff";
                          }
                        })(),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1rem",
                        flexShrink: 0,
                      }}
                    >
                      {item.tipo === "criacao" && <FaPlusCircle />}
                      {item.tipo === "nota" && <FaRegStickyNote />}
                      {item.tipo === "mudanca_prioridade" && <FaFlag />}
                      {item.tipo === "mudanca_status" && (
                        <>
                          {item.para === "aberto" && <FaExclamationCircle />}
                          {item.para === "andamento" && <FaPlayCircle />}
                          {item.para === "prodabel" && <FaExternalLinkAlt />}
                          {item.para === "resolvido" && <FaCheckCircle />}
                          {!["aberto", "andamento", "prodabel", "resolvido"].includes(
                            item.para,
                          ) && <FaExchangeAlt />}
                        </>
                      )}
                    </div>
                    <div>
                      <div
                        style={{ fontWeight: 500, fontSize: "0.9rem", marginBottom: 2 }}
                      >
                        {(() => {
                          const formatarValor = (v) => {
                            const nomes = {
                              aberto: "Recebido",
                              andamento: "Em Andamento",
                              prodabel: "Encaminha para Prodabel",
                              resolvido: "Resolvido",
                              baixa: "Baixa",
                              normal: "Normal",
                              alta: "Alta",
                              urgente: "Urgente",
                            };
                            return nomes[v] || v;
                          };

                          if (item.tipo === "criacao") return "Chamado Criado";
                          if (item.tipo === "mudanca_status") {
                            return `${item.adminNome || "Sistema"} alterou o status para ${formatarValor(item.para)}`;
                          }
                          if (item.tipo === "mudanca_prioridade") {
                            return `${item.adminNome || "O administrador"} atualizou a prioridade para ${formatarValor(item.para)}`;
                          }
                          // Fallback para logs antigos salvos como nota
                          if (item.tipo === "nota" && item.texto?.startsWith("Prioridade:")) {
                            const val = item.texto.split(": ")[1];
                            return `${item.adminNome || "O administrador"} atualizou a prioridade para ${val}`;
                          }
                          return item.adminNome || item.nome || "Sistema";
                        })()}
                      </div>
                      <div style={{ fontSize: "0.75rem", opacity: 0.5, marginBottom: 6 }}>
                        {formatarData(item.criadoEm)}
                      </div>

                      {(item.tipo === "mudanca_prioridade" || (item.tipo === "nota" && item.texto?.startsWith("Prioridade:"))) && (
                        <div style={{
                          fontSize: "0.85rem",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          marginTop: 4
                        }}>
                          {(() => {
                            const nomes = { baixa: "Baixa", normal: "Normal", alta: "Alta", urgente: "Urgente" };
                            const cores = { baixa: "#32c8ff", normal: "#10b981", alta: "#f97316", urgente: "#b24fff" };

                            let valor = item.para;
                            if (item.tipo === "nota") {
                              const v = item.texto.split(": ")[1]?.toLowerCase();
                              valor = v;
                            }

                            const label = nomes[valor] || valor;
                            const cor = cores[valor] || "#888";

                            return (
                              <>
                                <FaCheckCircle color={cor} />
                                <span style={{ opacity: 0.8 }}>Prioridade:</span>
                                <strong style={{ color: cor }}>{label}</strong>
                              </>
                            );
                          })()}
                        </div>
                      )}
                      {item.tipo === "mudanca_status" && (
                        <div style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                          {(() => {
                            const nomes = { aberto: "Recebido", andamento: "Em Andamento", prodabel: "Prodabel", resolvido: "Resolvido" };
                            const para = nomes[item.para] || item.para;
                            if (item.de === "aberto" && item.para === "aberto") {
                              return (
                                <>
                                  Criado → <strong>{para}</strong>
                                </>
                              );
                            }
                            const de = nomes[item.de] || item.de;
                            return (
                              <>
                                {de} → <strong>{para}</strong>
                              </>
                            );
                          })()}
                        </div>
                      )}
                      {/* Componente para definir prioridade no item de criação */}
                      {item.tipo === "criacao" && eAdmin && (
                        <DefinirPrioridadeInline
                          chamadoId={id}
                          adminUid={uid}
                          adminNome={perfil?.nome || "Admin"}
                          prioridadeAtual={chamado?.prioridade}
                          onDefinida={() => setStatusSugerido("andamento")}
                        />
                      )}
                      {item.texto && !item.texto.startsWith("Prioridade:") && (
                        <div
                          style={{
                            fontSize: "0.9rem",
                            opacity: 0.9,
                            lineHeight: "1.5",
                            marginTop: 4,
                          }}
                        >
                          {item.texto}
                        </div>
                      )}
                    </div>
                  </Item>
                );
              }

              // Comentario
              return (
                <Item key={item.id} style={{ display: "flex", gap: 16 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "rgba(50, 200, 255, 0.1)",
                      color: "#32c8ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1rem",
                      flexShrink: 0,
                    }}
                  >
                    <FaCommentDots />
                  </div>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: "0.9rem", marginBottom: 2 }}>
                      {item.nome}{" "}
                      <span
                        style={{ opacity: 0.6, fontSize: "0.75rem", fontWeight: 400 }}
                      >
                        ({item.papel})
                      </span>
                    </div>
                    <div style={{ fontSize: "0.75rem", opacity: 0.5, marginBottom: 6 }}>
                      {formatarData(item.criadoEm)}
                    </div>
                    <div style={{ fontSize: "0.9rem", opacity: 0.9, lineHeight: "1.5" }}>
                      {item.mensagem}
                    </div>
                  </div>
                </Item>
              );
            })
          )}
        </Lista>
      </Caixa>

      <div>
        {eAdmin && (
          <>
            <AcoesAdminChamado
              chamadoId={id}
              adminUid={uid}
              adminNome={perfil?.nome || "Admin"}
              statusAtual={ultimoStatus}
              statusSugerido={statusSugerido}
              limparSugerido={() => setStatusSugerido(null)}
            />

            {/* Botão de Excluir */}
            <button
              onClick={() => setModalExcluirAberto(true)}
              style={{
                marginTop: 0,
                width: "100%",
                padding: "6px 10px",
                borderRadius: 10,
                cursor: "pointer",
                fontWeight: 600,
                background: "transparent",
                border: "none",
                color: "#ff4d4d",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.2s",
                opacity: 0.8,
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseOut={(e) => (e.currentTarget.style.opacity = "0.8")}
            >
              <FaTrashAlt /> Excluir Chamado
            </button>
          </>
        )}

        {/* Aqui futuramente entra o formulario de novo comentario para admin/visitante */}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {modalExcluirAberto && (
        <ModalOverlay onClick={() => setModalExcluirAberto(false)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 16px 0", color: "#ff4d4d" }}>
              <FaTrashAlt style={{ marginRight: 8 }} />
              Excluir Chamado
            </h3>
            <p style={{ margin: "0 0 16px 0", opacity: 0.8 }}>
              Esta ação é irreversível. Para confirmar, digite{" "}
              <strong style={{ color: "#ff4d4d" }}>excluir</strong> abaixo:
            </p>
            <InputExcluir
              type="text"
              placeholder="Digite 'excluir'"
              value={confirmacaoExcluir}
              onChange={(e) => setConfirmacaoExcluir(e.target.value)}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => {
                  setModalExcluirAberto(false);
                  setConfirmacaoExcluir("");
                }}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "transparent",
                  color: "inherit",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleExcluir}
                disabled={excluindo}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 8,
                  border: "none",
                  background:
                    confirmacaoExcluir.toLowerCase() === "excluir"
                      ? "#ff4d4d"
                      : "rgba(255,77,77,0.3)",
                  color: "white",
                  cursor:
                    confirmacaoExcluir.toLowerCase() === "excluir"
                      ? "pointer"
                      : "not-allowed",
                  fontWeight: 600,
                  opacity: excluindo ? 0.7 : 1,
                }}
              >
                {excluindo ? "Excluindo..." : "Confirmar"}
              </button>
            </div>
          </ModalBox>
        </ModalOverlay>
      )}
    </Grid>
  );
}
