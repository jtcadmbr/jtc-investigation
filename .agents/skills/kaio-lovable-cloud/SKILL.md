---
name: kaio-lovable-cloud
description: Use when any task involves the database, tables, columns, SQL, RLS, policies, auth, storage, migrations or saving data in this Lovable Cloud project (banco de dados, tabela, coluna, cadastro, salvar dados).
---

# Banco de dados do Lovable Cloud — JTC CDI

O banco deste projeto é alterado SOMENTE pelas ferramentas do servidor MCP `gecko_banco` do JTC Grilo. Se o banco ainda não estiver conectado, a própria ferramenta pede ao usuário para conectar e continua sozinha depois.

Este projeto usa o banco de dados do Lovable Cloud, acessado pelo JTC Grilo.
- Antes de criar ou mudar qualquer tabela, chame ver_estrutura_do_banco para conhecer o banco real.
- Para LER dados use consultar_dados (só SELECT).
- Para CRIAR, ALTERAR ou APAGAR qualquer coisa no banco use alterar_banco. O JTC Grilo mostra um cartão para o usuário permitir; se ele não permitir, NÃO insista.
- O usuário é leigo: no campo explicacao descreva em português simples, em uma ou duas frases, o que muda para ele (ex.: "Criar a tabela de clientes para guardar nome e telefone").
- Nunca peça ao usuário para abrir o editor SQL do Lovable nem para copiar SQL: você mesmo aplica com alterar_banco.
- Escreva SQL idempotente (create table if not exists, drop policy if exists antes de create policy) e ordene: tabelas, depois RLS, depois policies.
- Toda tabela nova precisa de RLS ativo e policies coerentes com o login do site (auth.uid()).
- Se o banco recusar, leia a mensagem de erro, corrija e chame alterar_banco de novo.

## Proibido

- Criar arquivo .sql de migração à mão (em `supabase/migrations/`, `docs/migrations/` ou qualquer lugar) para "aplicar depois". Arquivo não muda o banco.
- Escrever que uma alteração foi "aplicada" sem a ferramenta alterar_banco ter respondido sucesso.
- Pedir ao usuário para aplicar SQL, abrir o editor SQL ou rodar migração manualmente.

## Se as ferramentas `gecko_banco` não aparecerem para você

Não faça a parte do banco nem as telas que dependem dela. Pare e diga ao usuário: "Para eu alterar o banco de dados, clique no botão da nuvem no JTC Grilo e conecte o projeto do Lovable. Depois é só me pedir de novo. Se já estiver conectado, feche e abra o editor de novo pelo JTC Grilo."

As alterações aplicadas ficam registradas em `docs/migrations/` — não edite esses arquivos, eles são o histórico.
