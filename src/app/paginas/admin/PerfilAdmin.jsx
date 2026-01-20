import { useState, useEffect } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { FaSave, FaUndo, FaCloudUploadAlt, FaPalette, FaSlidersH, FaImage, FaUserShield, FaEnvelope, FaPlus, FaTrash, FaCheckCircle, FaCircle } from "react-icons/fa";
import { usarConfiguracoes } from "../../../contextos/ConfiguracoesContexto";
import { usarAuth } from "../../../contextos/AuthContexto";
import { enviarImagemParaCloudinary } from "../../../servicos/cloudinaryServico";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  margin: 0 auto;
  padding-bottom: 150px;
`;

const Sessao = styled.section`
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  margin-bottom: 24px;
  
  h2 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: ${({ theme }) => theme.cores.texto};
    letter-spacing: -0.01em;
  }

  svg {
    font-size: 1.1rem;
    color: ${({ theme }) => theme.cores.destaque};
    opacity: 0.8;
  }
`;

const PerfilInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  background: ${({ theme }) => theme.cores.brancoTransparente};
  border-radius: 8px;
  
  .icon-box {
    width: 38px;
    height: 38px;
    border-radius: 6px;
    background: ${({ theme }) => theme.cores.destaque};
    color: white;
    display: grid;
    place-items: center;
    font-size: 1rem;
  }

  .content {
    display: flex;
    flex-direction: column;
    
    label {
      font-size: 0.75rem;
      text-transform: uppercase;
      font-weight: 800;
      opacity: 0.5;
      letter-spacing: 0.05em;
    }
    
    span {
      font-size: 1rem;
      font-weight: 500;
    }
  }
`;

const GridOpcoes = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
`;

const OpcaoCor = styled.label`
  display: flex;
  flex-direction: column;
  gap: 10px;
  cursor: pointer;
  
  .label-text {
    font-size: 0.85rem;
    font-weight: 500;
    color: ${({ theme }) => theme.cores.textoFraco};
  }
`;

const InputCorWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  border-radius: 8px;
  background: ${({ theme }) => theme.cores.fundo};
  transition: border-color 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.cores.destaque};
  }

  input[type="color"] {
    appearance: none;
    border: none;
    width: 28px;
    height: 28px;
    cursor: pointer;
    background: transparent;
    padding: 0;
    &::-webkit-color-swatch { border: none; border-radius: 4px; }
  }

  code {
    font-size: 0.85rem;
    font-family: 'JetBrains Mono', monospace;
    opacity: 0.7;
    text-transform: uppercase;
  }
`;

const ManagerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ManagerItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: ${({ theme }) => theme.cores.brancoTransparente};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.cores.borda};

  input[type="text"] {
    flex: 1;
    background: transparent;
    border: none;
    color: white;
    font-weight: 500;
    font-size: 0.9rem;
    outline: none;
  }

  input[type="color"] {
    width: 24px;
    height: 24px;
    border: none;
    cursor: pointer;
    background: transparent;
    &::-webkit-color-swatch { border-radius: 50%; border: none; }
  }

  .btn-remove {
    background: transparent;
    border: none;
    color: #ff4d4d;
    cursor: pointer;
    padding: 6px;
    opacity: 0.6;
    &:hover { opacity: 1; }
  }
`;

const BtnAdd = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border-radius: 12px;
  border: 1px dashed ${({ theme }) => theme.cores.borda};
  background: transparent;
  color: ${({ theme }) => theme.cores.texto};
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;
  &:hover {
    background: ${({ theme }) => theme.cores.brancoTransparente};
    border-color: ${({ theme }) => theme.cores.destaque};
  }
`;

const SliderGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
`;

const SliderItem = styled.div`
  .head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    span { font-size: 0.9rem; font-weight: 500; }
    .value {
      background: ${({ theme }) => theme.cores.destaque};
      color: white;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 700;
    }
  }
  input[type="range"] {
    width: 100%;
    accent-color: ${({ theme }) => theme.cores.destaque};
    cursor: pointer;
  }
`;

const DropZone = styled.label`
  width: 100%;
  min-height: 200px;
  border: 2px dashed ${({ theme }) => theme.cores.borda};
  border-radius: ${({ theme }) => theme.ui.raio}px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: rgba(0,0,0,0.05);
  &:hover { border-color: ${({ theme }) => theme.cores.destaque}; background: ${({ theme }) => theme.cores.brancoTransparente}; }
  input { display: none; }
  img { max-width: 300px; max-height: 150px; object-fit: contain; }
`;

const FloatingActions = styled.div`
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 48px);
  max-width: 600px;
  z-index: 100;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 12px;
  padding: 12px;
  background: ${({ theme }) => theme.cores.vidroForte};
  backdrop-filter: blur(20px);
  border: 1px solid ${({ theme }) => theme.cores.borda};
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.4);
  @media (min-width: 1024px) { left: calc(50% + 120px); }
`;

const BotaoBase = styled.button`
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
`;

const BotaoSalvar = styled(BotaoBase)`
  background: ${({ theme }) => theme.cores.destaque};
  color: white;
  border: none;
  &:hover { filter: brightness(1.1); transform: translateY(-2px); }
`;

const BotaoReset = styled(BotaoBase)`
  background: transparent;
  color: ${({ theme }) => theme.cores.texto};
  border: 1px solid ${({ theme }) => theme.cores.borda};
  &:hover { background: ${({ theme }) => theme.cores.brancoTransparente}; }
`;

export default function PerfilAdmin() {
  const { perfil } = usarAuth();
  const { configUI, atualizarConfig, carregando } = usarConfiguracoes();
  const [localConfig, setLocalConfig] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (configUI && !localConfig) {
      setLocalConfig(JSON.parse(JSON.stringify(configUI)));
    }
  }, [configUI]);

  if (carregando || !localConfig) return null;

  const save = (newConfig) => setLocalConfig({ ...newConfig });

  const addItem = (key) => {
    const item = { id: `manual_${Date.now()}`, label: "Nova Opção", color: "#ffffff" };
    save({ ...localConfig, [key]: [...localConfig[key], item] });
  };

  const updateItem = (key, id, prop, val) => {
    const updated = localConfig[key].map(it => it.id === id ? { ...it, [prop]: val } : it);
    save({ ...localConfig, [key]: updated });
  };

  const removeItem = (key, id) => {
    save({ ...localConfig, [key]: localConfig[key].filter(it => it.id !== id) });
  };

  const handleUploadLogo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploading(true);
      const dados = await enviarImagemParaCloudinary(file);
      save({ ...localConfig, logo: { ...dados, url: dados.url } });
      toast.success("Logo atualizada!");
    } finally { setUploading(false); }
  };

  const salvarTudo = async () => {
    try {
      await atualizarConfig(localConfig);
      toast.success("Tudo salvo com sucesso!");
    } catch { toast.error("Erro ao salvar."); }
  };

  return (
    <Container>
      <Sessao>
        <Cartao>
          <HeaderCartao><FaUserShield /><h2>Perfil e Acesso</h2></HeaderCartao>
          <PerfilInfo>
            <InfoItem>
              <div className="icon-box"><FaUserShield /></div>
              <div className="content"><label>Nome</label><span>{perfil?.nome || "Admin"}</span></div>
            </InfoItem>
            <InfoItem>
              <div className="icon-box" style={{ background: '#3b82f6' }}><FaEnvelope /></div>
              <div className="content"><label>E-mail</label><span>{perfil?.email || "---"}</span></div>
            </InfoItem>
          </PerfilInfo>
        </Cartao>
      </Sessao>

      <Sessao>
        <GridOpcoes>
          <Cartao style={{ gridColumn: 'span 2' }}>
            <HeaderCartao><FaPalette /><h2>Cores do Tema</h2></HeaderCartao>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
              {Object.keys(localConfig.cores).map(chave => (
                <OpcaoCor key={chave}>
                  <span className="label-text">{chave}</span>
                  <InputCorWrapper>
                    <input type="color" value={localConfig.cores[chave]}
                      onChange={e => save({ ...localConfig, cores: { ...localConfig.cores, [chave]: e.target.value } })} />
                    <code>{localConfig.cores[chave]}</code>
                  </InputCorWrapper>
                </OpcaoCor>
              ))}
            </div>
          </Cartao>

          <Cartao>
            <HeaderCartao><FaImage /><h2>Identidade</h2></HeaderCartao>
            <DropZone>
              {localConfig.logo?.url ? <img src={localConfig.logo.url} alt="Logo" /> :
                <><FaCloudUploadAlt size={32} /><span style={{ opacity: 0.5 }}>Subir Logo</span></>}
              <input type="file" accept="image/*" onChange={handleUploadLogo} disabled={uploading} />
            </DropZone>
          </Cartao>
        </GridOpcoes>
      </Sessao>

      <Sessao>
        <GridOpcoes>
          <Cartao>
            <HeaderCartao><FaCheckCircle /><h2>Gerenciar Status</h2></HeaderCartao>
            <ManagerList>
              {localConfig.status?.map(s => (
                <ManagerItem key={s.id}>
                  <input type="color" value={s.color} onChange={e => updateItem('status', s.id, 'color', e.target.value)} />
                  <input type="text" value={s.label} onChange={e => updateItem('status', s.id, 'label', e.target.value)} />
                  <button className="btn-remove" onClick={() => removeItem('status', s.id)}><FaTrash /></button>
                </ManagerItem>
              ))}
              <BtnAdd onClick={() => addItem('status')}><FaPlus /> Novo Status</BtnAdd>
            </ManagerList>
          </Cartao>

          <Cartao>
            <HeaderCartao><FaSlidersH /><h2>Prioridades</h2></HeaderCartao>
            <ManagerList>
              {localConfig.prioridades?.map(p => (
                <ManagerItem key={p.id}>
                  <input type="color" value={p.color} onChange={e => updateItem('prioridades', p.id, 'color', e.target.value)} />
                  <input type="text" value={p.label} onChange={e => updateItem('prioridades', p.id, 'label', e.target.value)} />
                  <button className="btn-remove" onClick={() => removeItem('prioridades', p.id)}><FaTrash /></button>
                </ManagerItem>
              ))}
              <BtnAdd onClick={() => addItem('prioridades')}><FaPlus /> Nova Prioridade</BtnAdd>
            </ManagerList>
          </Cartao>
        </GridOpcoes>
      </Sessao>

      <Sessao>
        <Cartao>
          <HeaderCartao><FaSlidersH /><h2>Ajustes Gerais de Interface</h2></HeaderCartao>
          <SliderGroup>
            <SliderItem>
              <div className="head"><span>Bordas (Radius)</span><span className="value">{localConfig.preferencias.raio}px</span></div>
              <input type="range" min="0" max="32" value={localConfig.preferencias.raio}
                onChange={e => save({ ...localConfig, preferencias: { ...localConfig.preferencias, raio: Number(e.target.value) } })} />
            </SliderItem>
            <SliderItem>
              <div className="head"><span>Transparência (Glass Blur)</span><span className="value">{localConfig.preferencias.blur}px</span></div>
              <input type="range" min="0" max="40" value={localConfig.preferencias.blur}
                onChange={e => save({ ...localConfig, preferencias: { ...localConfig.preferencias, blur: Number(e.target.value) } })} />
            </SliderItem>
          </SliderGroup>
        </Cartao>
      </Sessao>

      <FloatingActions>
        <BotaoReset onClick={() => window.location.reload()}><FaUndo /> Descartar</BotaoReset>
        <BotaoSalvar onClick={salvarTudo}><FaSave /> Salvar Todas as Alterações</BotaoSalvar>
      </FloatingActions>
    </Container>
  );
}
