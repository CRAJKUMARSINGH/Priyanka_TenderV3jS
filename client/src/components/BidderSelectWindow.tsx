// client/src/components/BidderSelectWindow.tsx
import styled from 'styled-components';

const Window = styled.div`
  width: 125mm;
  height: 15mm;
  overflow: hidden;
  @media (max-width: 400px) {
    width: 90mm;
  }
`;

export default function BidderSelectWindow({ children }) {
  return <Window>{children}</Window>;
}