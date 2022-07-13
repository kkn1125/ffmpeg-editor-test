import React from "react";
import { Outlet } from "react-router-dom";
import styled from "styled-components";

function Layout() {
  return (
    <Container>
      <Layout.Header />
      <Layout.Body>
        <Outlet />
      </Layout.Body>
      <Layout.Footer />
    </Container>
  );
}

const Container = styled.div`
  width: 90%;
  margin-left: auto;
  margin-right: auto;
`;

Layout.Header = styled.header`
  border-bottom: 1px solid #cdcdcd;
`;

Layout.Body = styled.div``;

Layout.Footer = styled.footer``;

export default Layout;
