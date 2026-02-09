import styled from "styled-components";
import React from "react";
import { COLORS, SPACING, ANIMATION } from "../styles/tokens";

const StyledButton = styled.button<{ $isLoading?: boolean | undefined }>`
  background-color: ${(props) =>
    props.disabled ? COLORS.disabled : COLORS.primary};
  color: ${COLORS.white};
  padding: ${SPACING.padding};
  border-radius: ${SPACING.borderRadius};
  border: none;
  cursor: ${(props) =>
    props.disabled || props.$isLoading ? "not-allowed" : "pointer"};
  font-weight: 600;
  transition: ${ANIMATION.transition};

  &:hover {
    background-color: ${(props) =>
      props.disabled ? COLORS.disabled : COLORS.primaryHover};
  }

  &:active {
    transform: scale(${ANIMATION.activeScale});
  }
`;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

export const PrimaryButton: React.FC<ButtonProps> = ({
  children,
  isLoading,
  ...props
}) => {
  return (
    <StyledButton $isLoading={isLoading} {...props}>
      {isLoading ? "Processing..." : children}
    </StyledButton>
  );
};
