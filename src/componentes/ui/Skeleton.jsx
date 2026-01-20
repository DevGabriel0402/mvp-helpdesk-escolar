import styled, { keyframes } from "styled-components";

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const SkeletonBase = styled.div`
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.03) 0%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(255, 255, 255, 0.03) 100%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite ease-in-out;
  border-radius: ${({ $radius }) => $radius || "8px"};
`;

// Skeleton para texto (uma linha)
export const SkeletonText = styled(SkeletonBase)`
  height: ${({ $height }) => $height || "16px"};
  width: ${({ $width }) => $width || "100%"};
  margin: ${({ $margin }) => $margin || "0"};
`;

// Skeleton para título
export const SkeletonTitle = styled(SkeletonBase)`
  height: 28px;
  width: ${({ $width }) => $width || "60%"};
  margin-bottom: 12px;
`;

// Skeleton para avatar/círculo
export const SkeletonAvatar = styled(SkeletonBase)`
  width: ${({ $size }) => $size || "48px"};
  height: ${({ $size }) => $size || "48px"};
  border-radius: 50%;
`;

// Skeleton para card completo
export const SkeletonCard = styled(SkeletonBase)`
  padding: 20px;
  min-height: ${({ $height }) => $height || "100px"};
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

// Skeleton para linha de tabela
export const SkeletonRow = styled(SkeletonBase)`
  height: 56px;
  width: 100%;
  margin-bottom: 8px;
`;

// Container para múltiplos skeletons
const SkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ $gap }) => $gap || "12px"};
`;

// Componente wrapper para simplificar uso
export function Skeleton({ variant = "text", count = 1, ...props }) {
    const items = Array(count).fill(null);

    switch (variant) {
        case "title":
            return <SkeletonTitle {...props} />;
        case "avatar":
            return <SkeletonAvatar {...props} />;
        case "card":
            return (
                <SkeletonContainer $gap={props.$gap}>
                    {items.map((_, i) => (
                        <SkeletonCard key={i} {...props} />
                    ))}
                </SkeletonContainer>
            );
        case "row":
            return (
                <SkeletonContainer $gap="0">
                    {items.map((_, i) => (
                        <SkeletonRow key={i} {...props} />
                    ))}
                </SkeletonContainer>
            );
        case "stat":
            return (
                <SkeletonCard $height="80px" style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    <SkeletonAvatar $size="48px" />
                    <div style={{ flex: 1 }}>
                        <SkeletonText $width="40%" $height="24px" $margin="0 0 8px 0" />
                        <SkeletonText $width="70%" $height="14px" />
                    </div>
                </SkeletonCard>
            );
        default:
            return (
                <SkeletonContainer $gap={props.$gap}>
                    {items.map((_, i) => (
                        <SkeletonText key={i} {...props} />
                    ))}
                </SkeletonContainer>
            );
    }
}

export default Skeleton;
