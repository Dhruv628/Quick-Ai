import styled, { keyframes, css } from 'styled-components';

const createScaleAnimation = (color) => keyframes`
  20% {
    background-color: ${color || '#fff'};
    transform: scaleY(1.5);
  }

  40% {
    transform: scaleY(1);
  }
`;

const Loader = ({ color }) => {
  return (
    <StyledWrapper color={color}>
      <div className='loader'>
        <span className="bar" />
        <span className="bar" />
        <span className="bar" />
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .loader {
    display: flex;
    align-items: center;
  }
  
  ${props => {
    const animation = createScaleAnimation(props.color);
    return css`animation: ${animation};`
  }}

  .bar {
    display: inline-block;
    width: 3px;
    height: 10px;
    background-color: ${props => props.color || 'rgba(255, 255, 255, 0.5)'};
    border-radius: 10px;
    animation: ${props => createScaleAnimation(props.color)} 1s linear infinite;
  }

  .bar:nth-child(2) {
    height: 18px;
    margin: 0 5px;
    animation-delay: 0.25s;
  }

  .bar:nth-child(3) {
    animation-delay: 0.5s;
  }
`;

export default Loader;
