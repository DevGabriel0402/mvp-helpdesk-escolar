import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import {
  FaSave,
  FaUndo,
  FaCloudUploadAlt,
  FaUserShield,
  FaEnvelope,
  FaBuilding,
  FaWifi,
} from "react-icons/fa";
import { useAuth } from "../../../contextos/AuthContexto";
import {
  enviarImagemParaCloudinary,
  gerarUrlCloudinary256,
} from "../../../servicos/cloudinaryServico";
import {
  buscarPerfilBasico,
  carregarPerfilBasicoLocal,
  salvarPerfilBasico,
} from "../../../servicos/firebase/perfilServico";
import { salvarPainelPublico } from "../../../servicos/firebase/painelServico";
import { aplicarFavicon, aplicarManifestDinamico } from "../../../utils/aplicarIconesPWA";
import { toast } from "react-toastify";

const Container = styled.div`
  display: grid;
  gap: 12px;
`;

const Cartao = styled.div`
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: ${({ theme }) => theme.cores.vidro};
  backdrop-filter: blur(16px);
  border-radius: 18px;
  padding: 20px;
`;

const Titulo = styled.h2`
  margin: 0 0 16px 0;
  font-size: 18px;
  color: ${({ theme }) => theme.cores.texto};
  display: flex;
  align-items: center;
  gap: 10px;

  svg {
    opacity: 0.7;
  }
`;

const GridLayout = styled.div`
  display: grid;
  gap: 24px;

  @media (min-width: 768px) {
    grid-template-columns: 200px 1fr;
    align-items: start;
  }
`;

/* ===== DROPZONE ===== */
const DropZone = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 16px;
  border: 2px dashed
    ${({ theme, $arrastando }) => ($arrastando ? "#3B82F6" : theme.cores.borda)};
  background: ${({ theme, $arrastando }) =>
    $arrastando ? "rgba(59, 130, 246, 0.06)" : theme.cores.pretoTransparente};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  justify-self: center;

  &:hover {
    border-color: rgba(59, 130, 246, 0.5);
    background: rgba(59, 130, 246, 0.04);
  }
`;

const DropIcon = styled.div`
  font-size: 2.2rem;
  color: ${({ theme, $arrastando }) =>
    $arrastando ? "#3B82F6" : theme.cores.textoFraco};
  opacity: 0.6;
`;

const DropTexto = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.cores.textoFraco};
  text-align: center;
  line-height: 1.5;
  padding: 0 16px;

  strong {
    color: #3b82f6;
  }
`;

const DropFormatos = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.cores.textoFraco};
  opacity: 0.5;
`;

/* ===== PREVIEW ===== */
const PreviewBox = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: ${({ theme }) => theme.cores.pretoTransparente};
  position: relative;
  overflow: hidden;
  justify-self: center;

  &:hover .overlay {
    opacity: 1;
  }
`;

const PreviewImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PreviewOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  opacity: 0;
  transition: opacity 0.2s ease;
`;

const OverlayBtn = styled.button`
  height: 38px;
  padding: 0 16px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: ${({ $primary }) =>
    $primary ? "rgba(59, 130, 246, 0.85)" : "rgba(255, 255, 255, 0.1)"};
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ $danger, $primary }) =>
      $danger
        ? "rgba(239, 68, 68, 0.85)"
        : $primary
          ? "#2563EB"
          : "rgba(255, 255, 255, 0.2)"};
  }
`;

/* ===== UPLOAD LOADING ===== */
const UploadingBox = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: ${({ theme }) => theme.cores.pretoTransparente};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  justify-self: center;
`;

const UploadingText = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.cores.textoFraco};
`;

const ProgressBar = styled.div`
  width: 140px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${({ $progress }) => $progress}%;
  background: #3b82f6;
  border-radius: 2px;
  transition: width 0.3s ease;
`;

/* ===== FORM ===== */
const Coluna = styled.div`
  display: grid;
  gap: 16px;
`;

const Campo = styled.div`
  display: grid;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.cores.textoFraco};
`;

const Input = styled.input`
  height: 48px;
  width: 100%;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: ${({ theme }) => theme.cores.pretoTransparente};
  color: ${({ theme }) => theme.cores.texto};
  padding: 0 16px;
  outline: none;
  font-size: 15px;
  transition: all 0.2s;

  &::placeholder {
    color: ${({ theme }) => theme.cores.textoFraco};
  }

  &:focus {
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    border-color: rgba(59, 130, 246, 0.4);
  }
`;

const InfoGrid = styled.div`
  display: grid;
  gap: 10px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: ${({ theme }) => theme.cores.brancoTransparente};

  .icon-box {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: rgba(59, 130, 246, 0.15);
    color: #3b82f6;
    display: grid;
    place-items: center;
    font-size: 14px;
    flex-shrink: 0;
  }

  .content {
    display: flex;
    flex-direction: column;
    min-width: 0;

    .label {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 600;
      opacity: 0.5;
      letter-spacing: 0.05em;
      margin-bottom: 2px;
    }

    .value {
      font-size: 14px;
      font-weight: 500;
      color: ${({ theme }) => theme.cores.texto};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
`;

const pulseOnline = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
  50% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
`;

const StatusBolinha = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ $online }) => ($online ? "#22c55e" : "#ef4444")};
  animation: ${({ $online }) => ($online ? pulseOnline : "none")} 2s ease-in-out infinite;
  flex-shrink: 0;
`;

const Acoes = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 6px;

  @media (min-width: 768px) {
    justify-content: flex-start;
  }
`;

const Botao = styled.button`
  height: 44px;
  padding: 0 20px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: rgba(59, 130, 246, 0.15);
  color: ${({ theme }) => theme.cores.texto};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
  flex: 1;

  @media (min-width: 768px) {
    flex: none;
  }

  &:hover:not(:disabled) {
    background: #3b82f6;
    border-color: #3b82f6;
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const BotaoSecundario = styled(Botao)`
  background: transparent;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.cores.vidroForte};
    border-color: ${({ theme }) => theme.cores.borda};
    color: ${({ theme }) => theme.cores.texto};
  }
`;

const AvisoNaoAdmin = styled.div`
  text-align: center;
  padding: 40px 20px;
  opacity: 0.7;
`;

const padrao = {
  nomePainel: "Helpdesk",
  logo: {
    url: "",
    publicId: "",
    url256: "",
    largura: 0,
    altura: 0,
  },
};

export default function PerfilAdmin() {
  const { usuarioAuth, perfil, eAdmin } = useAuth();
  const uid = usuarioAuth?.uid;

  const [nomePainel, setNomePainel] = useState(padrao.nomePainel);
  const [logo, setLogo] = useState(padrao.logo);
  const [salvando, setSalvando] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [arrastando, setArrastando] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);

  const inputRef = useRef(null);

  // Detectar mudanças de conexão
  useEffect(() => {
    function handleOnline() {
      setOnline(true);
    }
    function handleOffline() {
      setOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const nomeAdmin = useMemo(
    () => perfil?.nome || perfil?.displayName || "Administrador",
    [perfil],
  );
  const emailAdmin = useMemo(
    () => perfil?.email || usuarioAuth?.email || "-",
    [perfil, usuarioAuth],
  );

  const temImagem = Boolean(logo?.url256);

  useEffect(() => {
    async function carregar() {
      if (!uid || !eAdmin) return;

      const local = carregarPerfilBasicoLocal(uid);
      if (local?.nomePainel) setNomePainel(local.nomePainel);
      if (local?.logo) setLogo(local.logo);

      const remoto = await buscarPerfilBasico(uid);
      if (remoto?.nomePainel) setNomePainel(remoto.nomePainel);
      if (remoto?.logo) setLogo(remoto.logo);

      const url256 = remoto?.logo?.url256 || local?.logo?.url256;
      if (url256) {
        aplicarFavicon(url256);
        aplicarManifestDinamico({
          nomePainel: remoto?.nomePainel || local?.nomePainel,
          url256,
        });
      }
      if (remoto?.nomePainel || local?.nomePainel) {
        document.title = remoto?.nomePainel || local?.nomePainel || "Helpdesk";
      }
    }
    carregar();
  }, [uid, eAdmin]);

  const processarArquivo = useCallback(async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem válida.");
      return;
    }

    try {
      setUploading(true);
      setProgress(0);

      // Simula progresso
      const interval = setInterval(() => {
        setProgress((p) => (p < 90 ? p + 10 : p));
      }, 200);

      const up = await enviarImagemParaCloudinary(file);
      const url256 = gerarUrlCloudinary256(up.publicId);

      clearInterval(interval);
      setProgress(100);

      const novoLogo = {
        url: up.url,
        publicId: up.publicId,
        url256,
        largura: up.largura,
        altura: up.altura,
      };

      setLogo(novoLogo);
      toast.success("Logo enviada!");
    } catch (err) {
      toast.error("Erro ao enviar logo.");
      console.error(err);
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  }, []);

  function onEscolherArquivo(e) {
    processarArquivo(e.target.files?.[0]);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setArrastando(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setArrastando(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setArrastando(false);
    processarArquivo(e.dataTransfer.files?.[0]);
  }

  function resetar() {
    setNomePainel(padrao.nomePainel);
    setLogo(padrao.logo);
    toast.info("Resetado para o padrão.");
  }

  async function salvar() {
    if (!uid) return;
    try {
      setSalvando(true);

      const dados = {
        nomePainel: (nomePainel || "Helpdesk").trim(),
        logo,
      };

      await salvarPerfilBasico(uid, dados);

      // Salvar no painel público para visitantes
      await salvarPainelPublico("escola_padrao", {
        nomePainel: dados.nomePainel,
        logo: { url256: dados.logo?.url256 || "" },
      });

      document.title = dados.nomePainel;
      if (dados.logo?.url256) {
        aplicarFavicon(dados.logo.url256);
        aplicarManifestDinamico({
          nomePainel: dados.nomePainel,
          url256: dados.logo.url256,
        });
      } else {
        aplicarManifestDinamico({ nomePainel: dados.nomePainel, url256: "" });
      }

      toast.success("Perfil salvo!");
    } catch (err) {
      toast.error("Erro ao salvar.");
      console.error(err);
    } finally {
      setSalvando(false);
    }
  }

  if (!eAdmin) {
    return (
      <Container>
        <Cartao>
          <AvisoNaoAdmin>Disponível apenas para administradores.</AvisoNaoAdmin>
        </Cartao>
      </Container>
    );
  }

  return (
    <Container>
      <Cartao>
        <Titulo>
          <FaBuilding />
          Identidade do Sistema
        </Titulo>

        <GridLayout>
          {/* UPLOADING */}
          {uploading && (
            <UploadingBox>
              <FaCloudUploadAlt style={{ fontSize: "2rem", opacity: 0.5 }} />
              <UploadingText>Enviando...</UploadingText>
              <ProgressBar>
                <ProgressFill $progress={progress} />
              </ProgressBar>
            </UploadingBox>
          )}

          {/* HAS IMAGE */}
          {temImagem && !uploading && (
            <PreviewBox>
              <PreviewImg src={logo.url256} alt="Logo" />
              <PreviewOverlay className="overlay">
                <OverlayBtn
                  $primary
                  type="button"
                  onClick={() => inputRef.current?.click()}
                >
                  <FaCloudUploadAlt /> Trocar
                </OverlayBtn>
              </PreviewOverlay>
            </PreviewBox>
          )}

          {/* NO IMAGE - DROPZONE */}
          {!temImagem && !uploading && (
            <DropZone
              $arrastando={arrastando}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <DropIcon $arrastando={arrastando}>
                <FaCloudUploadAlt />
              </DropIcon>
              <DropTexto>
                {arrastando ? (
                  <strong>Solte aqui</strong>
                ) : (
                  <>
                    Arraste uma imagem
                    <br />
                    ou <strong>clique aqui</strong>
                  </>
                )}
              </DropTexto>
              <DropFormatos>PNG, JPG, SVG</DropFormatos>
            </DropZone>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={onEscolherArquivo}
            style={{ display: "none" }}
          />

          <Coluna>
            <Campo>
              <Label>Nome do Painel</Label>
              <Input
                value={nomePainel}
                onChange={(e) => setNomePainel(e.target.value)}
                placeholder="Ex: Helpdesk Escola X"
              />
            </Campo>

            <InfoGrid>
              <InfoItem>
                <div className="icon-box">
                  <FaUserShield />
                </div>
                <div className="content">
                  <span className="label">Administrador</span>
                  <span className="value">{nomeAdmin}</span>
                </div>
              </InfoItem>

              <InfoItem>
                <div className="icon-box">
                  <FaEnvelope />
                </div>
                <div className="content">
                  <span className="label">Email</span>
                  <span className="value">{emailAdmin}</span>
                </div>
              </InfoItem>

              <InfoItem>
                <div className="icon-box">
                  <FaWifi />
                </div>
                <div className="content">
                  <span className="label">Status</span>
                  <span
                    className="value"
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <StatusBolinha $online={online} />
                    {online ? "Online" : "Offline"}
                  </span>
                </div>
              </InfoItem>
            </InfoGrid>

            <Acoes>
              <BotaoSecundario type="button" onClick={resetar} disabled={salvando}>
                <FaUndo /> Resetar
              </BotaoSecundario>

              <Botao type="button" onClick={salvar} disabled={salvando}>
                <FaSave /> {salvando ? "Salvando..." : "Salvar"}
              </Botao>
            </Acoes>
          </Coluna>
        </GridLayout>
      </Cartao>
    </Container>
  );
}
