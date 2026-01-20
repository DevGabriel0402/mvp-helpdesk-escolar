import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import {
  FaSave,
  FaUndo,
  FaCloudUploadAlt,
  FaUserShield,
  FaEnvelope,
  FaIdCard,
  FaImage,
} from "react-icons/fa";
import { usarConfiguracoes } from "../../../contextos/ConfiguracoesContexto";
import { usarAuth } from "../../../contextos/AuthContexto";
import { enviarImagemParaCloudinary } from "../../../servicos/cloudinaryServico";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding-bottom: 40px;
`;

const Titulo = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.cores.texto};
  margin: 0 0 8px 0;
`;

const Subtitulo = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.cores.textoFraco};
  margin: 0 0 24px 0;
`;

const GridDupla = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Cartao = styled.div`
  background: ${({ theme }) => theme.cores.vidro};
  backdrop-filter: blur(${({ theme }) => theme.ui.blur}px);
  border: 1px solid ${({ theme }) => theme.cores.borda};
  border-radius: ${({ theme }) => theme.ui.raio}px;
  padding: 24px;
`;

const HeaderCartao = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;

  h2 {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: ${({ theme }) => theme.cores.texto};
  }

  svg {
    font-size: 1rem;
    color: ${({ theme }) => theme.cores.destaque};
    opacity: 0.8;
  }
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: ${({ theme }) => theme.cores.brancoTransparente};
  border-radius: 10px;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }

  .icon-box {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: ${({ theme }) => theme.cores.destaque};
    color: white;
    display: grid;
    place-items: center;
    font-size: 1rem;
    flex-shrink: 0;
  }

  .content {
    display: flex;
    flex-direction: column;
    min-width: 0;

    label {
      font-size: 0.7rem;
      text-transform: uppercase;
      font-weight: 700;
      opacity: 0.5;
      letter-spacing: 0.05em;
      margin-bottom: 2px;
    }

    span {
      font-size: 0.95rem;
      font-weight: 500;
      color: ${({ theme }) => theme.cores.texto};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
`;

const DropZone = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px 20px;
  border: 2px dashed ${({ theme }) => theme.cores.borda};
  border-radius: 12px;
  background: ${({ theme }) => theme.cores.brancoTransparente};
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 180px;

  &:hover {
    border-color: rgba(59, 130, 246, 0.4);
    background: rgba(59, 130, 246, 0.05);
  }

  ${({ $arrastando }) =>
    $arrastando &&
    `
    border-color: #3B82F6;
    background: rgba(59, 130, 246, 0.1);
  `}

  svg {
    font-size: 2rem;
    color: ${({ theme }) => theme.cores.textoFraco};
  }

  span {
    font-size: 0.85rem;
    color: ${({ theme }) => theme.cores.textoFraco};
    text-align: center;
  }
`;

const LogoPreview = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  img {
    max-width: 120px;
    max-height: 120px;
    object-fit: contain;
    border-radius: 8px;
  }

  button {
    background: transparent;
    border: 1px solid ${({ theme }) => theme.cores.borda};
    color: ${({ theme }) => theme.cores.texto};
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: rgba(59, 130, 246, 0.1);
      border-color: rgba(59, 130, 246, 0.3);
    }
  }
`;

const BotoesContainer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 16px;
`;

const BotaoSalvar = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;

  background: #3b82f6;
  border: none;
  color: white;

  &:hover {
    background: #2563eb;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const BotaoReset = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;

  background: transparent;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  color: ${({ theme }) => theme.cores.texto};

  &:hover {
    background: rgba(59, 130, 246, 0.1);
    border-color: rgba(59, 130, 246, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default function PerfilAdmin() {
  const { configUI, atualizarConfig } = usarConfiguracoes();
  const { perfil } = usarAuth();
  const inputFile = useRef(null);

  const [rascunho, setRascunho] = useState(null);
  const [arrastando, setArrastando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [enviandoLogo, setEnviandoLogo] = useState(false);

  useEffect(() => {
    if (configUI) {
      setRascunho(JSON.parse(JSON.stringify(configUI)));
    }
  }, [configUI]);

  if (!rascunho) return null;

  const temAlteracoes = JSON.stringify(rascunho) !== JSON.stringify(configUI);

  async function salvar() {
    setSalvando(true);
    try {
      await atualizarConfig(rascunho);
      toast.success("Configurações salvas!");
    } catch (e) {
      toast.error("Erro ao salvar configurações.");
    } finally {
      setSalvando(false);
    }
  }

  function resetar() {
    setRascunho(JSON.parse(JSON.stringify(configUI)));
    toast.info("Alterações descartadas.");
  }

  async function handleUploadLogo(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem válida.");
      return;
    }

    setEnviandoLogo(true);
    try {
      const result = await enviarImagemParaCloudinary(file);
      setRascunho((prev) => ({
        ...prev,
        logo: {
          url: result.secure_url,
          publicId: result.public_id,
          largura: result.width,
          altura: result.height,
        },
      }));
      toast.success("Logo enviado!");
    } catch (e) {
      toast.error("Erro ao enviar logo.");
    } finally {
      setEnviandoLogo(false);
    }
  }

  function removerLogo() {
    setRascunho((prev) => ({
      ...prev,
      logo: { url: "", publicId: "", largura: 0, altura: 0 },
    }));
  }

  function handleDragOver(e) {
    e.preventDefault();
    setArrastando(true);
  }

  function handleDragLeave() {
    setArrastando(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setArrastando(false);
    const file = e.dataTransfer.files[0];
    handleUploadLogo(file);
  }

  return (
    <Container>
      <div>
        <Titulo>Perfil do Administrador</Titulo>
        <Subtitulo>Gerencie suas informações e identidade visual</Subtitulo>
      </div>

      <GridDupla>
        {/* Informações do Perfil */}
        <Cartao>
          <HeaderCartao>
            <FaUserShield />
            <h2>Informações</h2>
          </HeaderCartao>

          <InfoItem>
            <div className="icon-box">
              <FaUserShield />
            </div>
            <div className="content">
              <label>Nome</label>
              <span>{perfil?.nome || "Administrador"}</span>
            </div>
          </InfoItem>

          <InfoItem>
            <div className="icon-box">
              <FaEnvelope />
            </div>
            <div className="content">
              <label>Email</label>
              <span>{perfil?.email || "—"}</span>
            </div>
          </InfoItem>

          <InfoItem>
            <div className="icon-box">
              <FaIdCard />
            </div>
            <div className="content">
              <label>Função</label>
              <span>Administrador</span>
            </div>
          </InfoItem>
        </Cartao>

        {/* Logo / Identidade */}
        <Cartao>
          <HeaderCartao>
            <FaImage />
            <h2>Logo / Favicon</h2>
          </HeaderCartao>

          {rascunho.logo?.url ? (
            <LogoPreview>
              <img src={rascunho.logo.url} alt="Logo" />
              <button onClick={removerLogo}>Remover Logo</button>
            </LogoPreview>
          ) : (
            <DropZone
              $arrastando={arrastando}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => inputFile.current?.click()}
            >
              {enviandoLogo ? (
                <span>Enviando...</span>
              ) : (
                <>
                  <FaCloudUploadAlt />
                  <span>
                    Arraste uma imagem aqui
                    <br />
                    ou clique para selecionar
                  </span>
                </>
              )}
              <input
                ref={inputFile}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleUploadLogo(e.target.files[0])}
              />
            </DropZone>
          )}
        </Cartao>
      </GridDupla>

      {/* Botões de Ação */}
      <BotoesContainer>
        <BotaoReset onClick={resetar} disabled={!temAlteracoes || salvando}>
          <FaUndo />
          Descartar
        </BotaoReset>
        <BotaoSalvar onClick={salvar} disabled={!temAlteracoes || salvando}>
          <FaSave />
          {salvando ? "Salvando..." : "Salvar Alterações"}
        </BotaoSalvar>
      </BotoesContainer>
    </Container>
  );
}
