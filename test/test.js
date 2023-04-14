/**
 * Tests for the parsing API in JavaScript
 */

import test from "ava";

import { readFile } from "node:fs/promises";
import { DOMParser } from "@xmldom/xmldom";

import { phyloxml, makeCompatTable } from "../src/index.js";

test("Can parse the sample", async (t) => {
  const text = await readFile("test/data/sample.xml", { encoding: "utf8" });
  const xml = new DOMParser().parseFromString(text);
  const tree = phyloxml.parse(xml);
  t.is(tree.name, "PhyD3 demo tree");
});

test("Can parse a tree with no id attributes", async (t) => {
  const text = await readFile("test/data/noids.xml", { encoding: "utf8" });
  const xml = new DOMParser().parseFromString(text);
  const tree = phyloxml.parse(xml);
  t.is(tree.branchset[0].id, "_1");
  t.is(tree.branchset[0].name, "25_BRAFL");
  t.is(phyloxml.cid, 1);
});

test("Can generate a compatible 'new-style' table", async (t) => {
  const text = await readFile("test/data/sample.xml", { encoding: "utf8" });
  const xml = new DOMParser().parseFromString(text);
  const tree = phyloxml.parse(xml);
  const table = makeCompatTable(tree);

  t.is(332, table.nodes.length);
  t.is(165, table.nodes.filter((n) => n.node === "Clade").length);
  t.is(167, table.nodes.filter((n) => n.node === "Taxa").length);

  t.is(331, table.edges.length);
  t.deepEqual(table.metadata, [
    {
      name: "PhyD3 demo tree",
      description: "Contains examples of commonly used elements",
      rooted: true,
      parent: 1,
    },
  ]);
});

test("Can generate a compatible 'new-style' table with no id attributes", async (t) => {
  const text = await readFile("test/data/all-nodes-named.xml", {
    encoding: "utf8",
  });
  const xml = new DOMParser().parseFromString(text);
  const tree = phyloxml.parse(xml);
  const table = makeCompatTable(tree);

  t.is(6, table.nodes.length);
  t.is(2, table.nodes.filter((n) => n.node === "Clade").length);
  t.is(4, table.nodes.filter((n) => n.node === "Taxa").length);

  t.is(5, table.edges.length);
  t.deepEqual(table.metadata, [
    {
      name: undefined,
      description: undefined,
      rooted: true,
      parent: 6,
    },
  ]);
});

test("Can generate compatible attribute maps", async (t) => {
  const text = await readFile("test/data/sample.xml", { encoding: "utf8" });
  const xml = new DOMParser().parseFromString(text);
  const tree = phyloxml.parse(xml);
  const table = makeCompatTable(tree);

  const md00g318760 = table.nodes
    .filter((node) => node.name === "MD00G318760")
    .map((node) => node.attributes)[0];

  const expected = new Map();
  const properties = new Map();
  const taxonomies = new Map();
  const sequences = new Map();
  const sequences0 = new Map();
  const domArch = new Map();
  const dom0 = new Map();
  const dom1 = new Map();
  properties.set("ref", { tag: "text", value: "See also" });
  properties.set("datatype", { tag: "text", value: "xsd:anyURI" });
  properties.set("appliesTo", { tag: "text", value: "clade" });
  properties.set("value", {
    tag: "text",
    value:
      "http://bioinformatics.psb.ugent.be/plaza/versions/plaza_v3_dicots/genes/view/MD00G318760",
  });
  taxonomies.set("code", { tag: "text", value: "mdo" });

  dom0.set("confidence", { tag: "numeric", value: 0.0000037 });
  dom0.set("from", { tag: "numeric", value: 135 });
  dom0.set("to", { tag: "numeric", value: 212 });
  dom0.set("name", { tag: "text", value: "IPR011992" });

  dom1.set("confidence", { tag: "numeric", value: 8.879 });
  dom1.set("from", { tag: "numeric", value: 181 });
  dom1.set("to", { tag: "numeric", value: 216 });
  dom1.set("name", { tag: "text", value: "IPR002048" });

  domArch.set("sequenceLength", { tag: "numeric", value: 402 });
  domArch.set("domains", {
    tag: "list",
    value: [
      { tag: "mapping", value: dom0 },
      { tag: "mapping", value: dom1 },
    ],
  });

  sequences0.set("domainArchitecture", { tag: "mapping", value: domArch });

  expected.set("properties", {
    tag: "list",
    value: [{ tag: "mapping", value: properties }],
  });
  expected.set("taxonomies", {
    tag: "list",
    value: [{ tag: "mapping", value: taxonomies }],
  });
  expected.set("sequences", {
    tag: "list",
    value: [{ tag: "mapping", value: sequences0 }],
  });
  expected.set("colortag", { tag: "text", value: "0xF52AD4" });
  expected.set("category", { tag: "text", value: "C" });

  t.deepEqual(md00g318760, expected);
});
