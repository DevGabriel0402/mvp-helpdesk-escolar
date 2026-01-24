import { useState, useEffect } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import {
  FaRegStickyNote,
  FaExchangeAlt,
  FaPlusCircle,
  FaMapMarkerAlt,
  FaUser,
  FaRegCalendarAlt,
  FaCommentDots,
  FaExclamationCircle,
  FaPlayCircle,
  FaCheckCircle,
  FaCheck,
  FaExternalLinkAlt,
  FaFlag,
  FaFilePdf,
} from "react-icons/fa";
import { CampoTexto } from "../../../componentes/ui/CampoTexto";
import { Botao } from "../../../componentes/ui/Botao";
import { useAuth } from "../../../contextos/AuthContexto";
import {
  buscarChamadoPorNumero,
  ouvirComentarios,
  ouvirAtualizacoes,
} from "../../../servicos/firebase/chamadosServico";
import { usePainelPublico } from "../../../hooks/usePainelPublico";
import { gerarPdfChamado } from "../../../utils/gerarPdfChamado";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 100%;
`;

const Caixa = styled.div`
  background: ${({ theme }) => theme.cores.fundo2};
  border: 1px solid ${({ theme }) => theme.cores.borda};
  border-radius: 8px;
  padding: 20px 24px;
`;

const Ajuda = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.cores.textoFraco};
`;

const CabecalhoChamado = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
`;

const CodigoChamado = styled.span`
  font-family: monospace;
  font-weight: 700;
  color: ${({ theme }) => theme.cores.texto};
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
      case "media":
        return "rgba(255, 200, 50, 0.15)";
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
      case "media":
        return "#ffc832";
      case "baixa":
        return "#32c8ff";
      case "urgente":
        return "#ff4d4d";
      default:
        return "#ccc";
    }
  }};
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
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 6px;
  width: fit-content;

  span {
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: capitalize;
    line-height: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
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
  overflow: hidden;
`;

const Item = styled.div`
  padding: 14px 16px;
  background: ${({ theme }) => theme.cores.fundo2};
`;

function normalizarEntrada(entrada) {
  const v = (entrada || "").trim().toUpperCase();
  // Suporta formato antigo HD-XXXX e novo OS N°XXXXX
  if (v.startsWith("OS N°") || v.startsWith("OS N")) {
    // Extrai somente números do código OS
    const numero = v.replace(/\D/g, "");
    if (numero) return { ticketNumber: Number(numero) };
  }
  const somenteNumero = v.replace(/\D/g, "");
  if (somenteNumero) return { ticketNumber: Number(somenteNumero) };
  return {};
}

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

function traduzirStatus(status) {
  switch (status) {
    case "aberto":
      return "Aberto";
    case "andamento":
      return "Em Progresso";
    case "resolvido":
      return "Chamado Finalizado";
    default:
      return status;
  }
}

export default function BuscarChamado() {
  const { perfil, eAdmin, eVisitante } = useAuth();
  const painel = usePainelPublico(perfil?.escolaId || "escola_padrao");

  const [entrada, setEntrada] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [chamado, setChamado] = useState(null);
  const [atualizacoes, setAtualizacoes] = useState([]);
  const [comentarios, setComentarios] = useState([]);

  useEffect(() => {
    if (!chamado?.id) return;

    const off1 = ouvirAtualizacoes(chamado.id, setAtualizacoes);
    const off2 = ouvirComentarios(chamado.id, setComentarios);

    return () => {
      off1?.();
      off2?.();
    };
  }, [chamado?.id]);

  const timeline = (() => {
    const tudo = [...comentarios, ...atualizacoes];

    if (chamado && chamado.criadoEm) {
      tudo.push({
        id: "inicio",
        _tipoItem: "atualizacao",
        tipo: "criacao",
        texto: "Chamado criado",
        adminNome: chamado.criadoPorNome || "Sistema",
        criadoEm: chamado.criadoEm,
      });
    }

    tudo.sort((a, b) => pegarMillis(a.criadoEm) - pegarMillis(b.criadoEm));
    return tudo;
  })();

  async function buscar(e) {
    e.preventDefault();

    const { ticketNumber, ticketCode } = normalizarEntrada(entrada);

    if (!ticketNumber && !ticketCode) {
      toast.error("Digite o numero do chamado ou o protocolo (ex: OS N°000123).");
      return;
    }

    setCarregando(true);
    try {
      // ✅ Visitante pesquisa apenas por numero/codigo
      // Admin pode buscar na escola dele, visitante busca na escola_padrao
      const resultado = await buscarChamadoPorNumero({
        escolaId: eAdmin ? perfil?.escolaId || "escola_padrao" : "escola_padrao",
        ticketNumber,
        ticketCode,
        tipoConsulta: eAdmin ? "admin" : "visitante",
      });

      if (!resultado) {
        toast.info("Nenhum chamado encontrado com esse numero.");
        setChamado(null);
        return;
      }

      // ✅ Visitante pode ver qualquer chamado pelo número
      // Admin continua podendo ver todos
      setChamado(resultado);
      toast.success("Chamado encontrado!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao buscar chamado.");
      setChamado(null);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Container>
      {/* Busca */}
      <Caixa>
        <h2 style={{ marginBottom: 8, marginTop: 0 }}>Buscar chamado</h2>
        <Ajuda>Digite o número ou protocolo (ex: OS N°00001).</Ajuda>

        <form onSubmit={buscar} style={{ marginTop: 16 }}>
          <div style={{ display: "grid", gap: 12 }}>
            <CampoTexto
              placeholder="Ex: 1 ou OS N°00001"
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
            />
            <Botao $larguraTotal disabled={carregando}>
              {carregando ? "Buscando..." : "Buscar"}
            </Botao>
          </div>
        </form>
      </Caixa>

      {/* Resultado */}
      {chamado && (
        <Caixa>
          <CabecalhoChamado>
            <CodigoChamado>
              {chamado?.codigoChamado || `#${chamado.numeroChamado}`}
            </CodigoChamado>
            <StatusBadge $status={chamado.status}>
              {chamado.status === "andamento"
                ? "Em Progresso"
                : chamado.status === "aberto"
                  ? "Recebido"
                  : chamado.status === "prodabel"
                    ? "Encaminha para Prodabel"
                    : chamado.status}
            </StatusBadge>
            <PrioridadeBadge $prio={chamado.prioridade}>
              {chamado.prioridade}
            </PrioridadeBadge>

            <BotaoAcaoHeader
              onClick={() => gerarPdfChamado({ chamado, painel, atualizacoes, comentarios })}
              title="Imprimir PDF"
            >
              <FaFilePdf />
              Imprimir
            </BotaoAcaoHeader>
          </CabecalhoChamado>

          <Titulo>{chamado.titulo}</Titulo>

          <InfoMeta>
            <span>
              <FaMapMarkerAlt /> {chamado?.localDoProblema || "Local não definido"}
            </span>
            <span>
              <FaUser /> {chamado?.criadoPorNome || "Anônimo"}
            </span>
            <span>
              <FaRegCalendarAlt /> {formatarData(chamado?.criadoEm)}
            </span>
          </InfoMeta>

          {chamado.descricao && <Descricao>{chamado.descricao}</Descricao>}

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
                              case "urgente":
                                return "rgba(255, 77, 77, 0.1)";
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
                          {item.tipo === "nota" && ""}
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
                              const cores = { baixa: "#32c8ff", normal: "#10b981", alta: "#f97316", urgente: "#ff4d4d" };

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
                              const nomes = { aberto: "Recebido", andamento: "Em Andamento", prodabel: "Encaminha para Prodabel", resolvido: "Resolvido" };
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
                        {item.texto && !item.texto.startsWith("Prioridade:") && (
                          <div
                            style={{
                              fontSize: "0.9rem",
                              opacity: 0.9,
                              lineHeight: "1.5",
                              marginTop: 4,
                            }}
                          >
                            {(() => {
                              // Converte formato antigo para o novo
                              if (item.texto.startsWith("N° do chamado:")) {
                                const numero = item.texto.replace("N° do chamado:", "").trim();
                                return `Chamado de número ${numero} aberto.`;
                              }
                              return item.texto;
                            })()}
                          </div>
                        )}
                      </div>
                    </Item>
                  );
                }

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
                      <div
                        style={{ fontWeight: 500, fontSize: "0.9rem", marginBottom: 2 }}
                      >
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
                      <div
                        style={{ fontSize: "0.9rem", opacity: 0.9, lineHeight: "1.5" }}
                      >
                        {item.mensagem}
                      </div>
                    </div>
                  </Item>
                );
              })
            )}
          </Lista>
        </Caixa>
      )
      }
    </Container >
  );
}
