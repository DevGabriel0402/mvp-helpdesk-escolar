import { useState, useEffect } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { FaSave, FaUndo, FaCloudUploadAlt, FaPalette, FaslidersH, FaImage } from "react-icons/fa";
import { usarConfiguracoes } from "../../../contextos/ConfiguracoesContexto";
import { enviarImagemParaCloudinary } from "../../../servicos/cloudinaryServico";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 800px;
  margin: 0 auto;
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
    font-size: 1.2rem;
    color: ${({ theme }) => theme.cores.texto};
  }

  svg {
    font-size: 1.2rem;
    color: ${({ theme }) => theme.cores.destaque};
  }
`;

const GridOpcoes = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
`;

const OpcaoCor = styled.label`
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
  
  span {
    font-size: 0.85rem;
    color: ${({ theme }) => theme.cores.textoFraco};
  }
`;

const InputCor = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  border-radius: 8px;
  background: ${({ theme }) => theme.cores.fundo2};

  input[type="color"] {
    border: none;
    width: 32px;
    height: 32px;
    cursor: pointer;
    background: transparent;
    border-radius: 4px;
    padding: 0;
  }

  code {
    font-size: 0.8rem;
    opacity: 0.8;
  }
`;

const SliderContainer = styled.div`
  margin-bottom: 16px;

  label {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 0.9rem;
  }

  input[type="range"] {
    width: 100%;
    accent-color: ${({ theme }) => theme.cores.destaque};
  }
`;

const UploadArea = styled.div`
  border: 2px dashed ${({ theme }) => theme.cores.borda};
  border-radius: ${({ theme }) => theme.ui.raio}px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: ${({ theme }) => theme.cores.fundo};

  &:hover {
    border-color: ${({ theme }) => theme.cores.destaque};
    background: ${({ theme }) => theme.cores.vidroForte};
  }

  input {
    display: none;
  }

  img {
    max-width: 150px;
    max-height: 150px;
    object-fit: contain;
    border-radius: 8px;
    margin-bottom: 10px;
  }
`;

const Botao = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 24px;
  border-radius: ${({ theme }) => theme.ui.raio}px;
  border: 1px solid ${({ $primario, theme }) => $primario ? theme.cores.destaque : theme.cores.borda};
  background: ${({ $primario, theme }) => $primario ? theme.cores.destaque : 'transparent'};
  color: ${({ $primario, theme }) => $primario ? '#fff' : theme.cores.texto};
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  width: 100%;

  &:hover {
    opacity: 0.9;
  }
`;

const ActionsBar = styled.div`
  display: flex;
  gap: 12px;
  position: sticky;
  bottom: 20px;
  z-index: 10;
  background: ${({ theme }) => theme.cores.vidroForte};
  backdrop-filter: blur(16px);
  padding: 16px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
`;

export default function PerfilAdmin() {
    const { configUI, atualizarConfig, carregando } = usarConfiguracoes();
    const [localConfig, setLocalConfig] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (configUI) {
            setLocalConfig(JSON.parse(JSON.stringify(configUI)));
        }
    }, [configUI]);

    if (carregando || !localConfig) return <div style={{ padding: 20 }}>Carregando configurações...</div>;

    const handleChangeCor = (chave, valor) => {
        setLocalConfig(prev => ({
            ...prev,
            cores: { ...prev.cores, [chave]: valor }
        }));
    };

    const handleChangeUi = (chave, valor) => {
        setLocalConfig(prev => ({
            ...prev,
            preferencias: { ...prev.preferencias, [chave]: Number(valor) }
        }));
    };

    const handleUploadLogo = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            const dados = await enviarImagemParaCloudinary(file);
            setLocalConfig(prev => ({
                ...prev,
                logo: {
                    url: dados.url,
                    publicId: dados.publicId,
                    largura: dados.largura,
                    altura: dados.altura
                }
            }));
            toast.success("Logo enviada com sucesso!");
        } catch (err) {
            console.error(err);
            toast.error("Erro ao enviar imagem: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    const salvar = async () => {
        try {
            await atualizarConfig(localConfig);
            toast.success("Configurações salvas e aplicadas!");
        } catch (error) {
            toast.error("Erro ao salvar.");
        }
    };

    const resetar = () => {
        if (window.confirm("Voltar para o padrão?")) {
            // Recarrega a página ou reseta manualmente
            window.location.reload();
        }
    };

    return (
        <Container>
            <Cartao>
                <HeaderCartao>
                    <FaImage />
                    <h2>Identidade Visual (Logo)</h2>
                </HeaderCartao>

                <UploadArea as="label">
                    {localConfig.logo?.url ? (
                        <div>
                            <img src={localConfig.logo.url} alt="Logo Atual" />
                            <p>Clique para trocar</p>
                        </div>
                    ) : (
                        <div>
                            <FaCloudUploadAlt size={40} style={{ marginBottom: 10, opacity: 0.5 }} />
                            <p>Clique para enviar uma Logo</p>
                        </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleUploadLogo} disabled={uploading} />
                    {uploading && <p>Enviando...</p>}
                </UploadArea>
            </Cartao>

            <Cartao>
                <HeaderCartao>
                    <FaPalette />
                    <h2>Cores do Sistema</h2>
                </HeaderCartao>

                <GridOpcoes>
                    <OpcaoCor>
                        <span>Destaque (Cor Principal)</span>
                        <InputCor>
                            <input
                                type="color"
                                value={localConfig.cores.destaque}
                                onChange={e => handleChangeCor("destaque", e.target.value)}
                            />
                            <code>{localConfig.cores.destaque}</code>
                        </InputCor>
                    </OpcaoCor>

                    <OpcaoCor>
                        <span>Fundo da Página</span>
                        <InputCor>
                            <input
                                type="color"
                                value={localConfig.cores.fundo}
                                onChange={e => handleChangeCor("fundo", e.target.value)}
                            />
                        </InputCor>
                    </OpcaoCor>

                    <OpcaoCor>
                        <span>Texto Principal</span>
                        <InputCor>
                            <input
                                type="color"
                                value={localConfig.cores.texto}
                                onChange={e => handleChangeCor("texto", e.target.value)}
                            />
                        </InputCor>
                    </OpcaoCor>

                    <OpcaoCor>
                        <span>Botões (Fundo)</span>
                        <InputCor>
                            <input
                                type="color"
                                value={localConfig.cores.botaoFundo}
                                onChange={e => handleChangeCor("botaoFundo", e.target.value)}
                            />
                        </InputCor>
                    </OpcaoCor>

                    <OpcaoCor>
                        <span>Badges (Fundo)</span>
                        <InputCor>
                            <input
                                type="color"
                                value={localConfig.cores.badgeFundo}
                                onChange={e => handleChangeCor("badgeFundo", e.target.value)}
                            />
                        </InputCor>
                    </OpcaoCor>
                </GridOpcoes>
            </Cartao>

            <Cartao>
                <HeaderCartao>
                    <FaslidersH />
                    <h2>Interface (UI)</h2>
                </HeaderCartao>

                <SliderContainer>
                    <label>
                        <span>Arredondamento (Raio): {localConfig.preferencias.raio}px</span>
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="30"
                        value={localConfig.preferencias.raio}
                        onChange={e => handleChangeUi("raio", e.target.value)}
                    />
                </SliderContainer>

                <SliderContainer>
                    <label>
                        <span>Desfoque (Glass Blur): {localConfig.preferencias.blur}px</span>
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="40"
                        value={localConfig.preferencias.blur}
                        onChange={e => handleChangeUi("blur", e.target.value)}
                    />
                </SliderContainer>
            </Cartao>

            <ActionsBar>
                <Botao onClick={resetar}><FaUndo /> Resetar</Botao>
                <Botao $primario onClick={salvar}><FaSave /> Salvar Alterações</Botao>
            </ActionsBar>
        </Container>
    );
}
