export * as phyloxml from "./phyloXML.js";

/**
 * A "new-style" PhyD3 compatability function:
 * transforms the result of phyloxml.parse into
 * a table that "new" PhyD3 can understand.
 *
 * Metadata {
 *   name: string | undefined; // The name of this tree
 *   parent: number; // reference to the root node of this tree
 *   rooted: boolean; // whether this tree is rooted
 *   description: string | undefined; // Description of this tree
 * }
 * Node {
 *   name: string; // Name of this Taxa or Clade
 *   ref: number; // Unique identifier (used to designate edge endpoints).
 *   node: 'Clade' | 'Taxa' | 'Hybrid' | 'LateralGeneTransfer' | 'Recombination';
 *   attributes: Map<string, Attribute>;
 * }
 * Edge {
 *   from: number; // unique ref of the source node
 *   len: number; // branch length
 *   to: number; // unique ref of the sink node
 * }
 * NumericAttribute {
 *   tag: 'numeric' | 'text' | 'bool' | 'list' | 'mapping'; // data type for this attribute
 *   value: number | string | boolean; // the attribute value
 * }
 * TextAttribute {
 *   tag: 'text';
 *   value: number;
 * }
 * BoolAttribute {
 *   tag: 'bool';
 *   value: boolean;
 * }
 * ListAttribute {
 *   tag: 'list';
 *   value: Array<Attribute>;
 * }
 * MappingAttribute {
 *   tag: 'mapping';
 *   value: Map<string, Attribute>;
 * }
 * Attribute = NumericAttribute | TextAttribute | BoolAttribute | ListAttribute | MappingAttribute;
 */
export const makeCompatTable = function (parsed) {
  return {
    nodes: parsed.branchset.flatMap(flattenNodes),
    edges: parsed.branchset.flatMap(flattenEdges),
    metadata: [
      {
        name: parsed.name,
        description: parsed.description,
        rooted: parsed.rooted === "true",
        parent: Number.parseInt(parsed.branchset[0].id),
      },
    ],
  };
};

const flattenNodes = function (branchset) {
  const attrs = new Map();

  Object.entries(branchset)
    .filter(
      (branch) =>
        branch[0] !== "name" &&
        branch[0] !== "branchLength" &&
        branch[0] !== "id" &&
        branch[0] !== "branchset"
    )
    .forEach((branch) => {
      const attr = parseAttr(branch[1]);
      if (attr.tag !== "reject") {
        attrs.set(branch[0], attr);
      }
    });

  const node = {
    name: branchset.name || "",
    ref: Number.parseInt(branchset.id, 10),
    node: branchset.branchset.length > 0 ? "Clade" : "Taxa",
    attributes: attrs,
  };

  return [node].concat(branchset.branchset.flatMap(flattenNodes));
};

const parseAttr = function (val) {
  const isNumber = new RegExp("^\\d*.?\\d*$");
  switch (typeof val) {
    case "boolean":
      return { tag: "bool", value: val };

    case "number":
      return { tag: "numeric", value: val };

    case "string": {
      if (val === "true") {
        return { tag: "bool", value: true };
      } else if (val === "false") {
        return { tag: "bool", value: false };
      } else if (isNumber.test(val) && !Number.isNaN(Number.parseFloat(val))) {
        return { tag: "numeric", value: Number.parseFloat(val) };
      } else if (val === "") {
        return { tag: "reject", value: undefined };
      } else {
        return { tag: "text", value: val };
      }
    }

    case "object": {
      if (val === undefined) {
        return { tag: "reject", value: null };
      } else if (Array.isArray(val)) {
        const result = val
          .map(parseAttr)
          .filter((attr) => attr.tag !== "reject");
        if (result.length === 0) {
          return {
            tag: "reject",
            value: null,
          };
        } else {
          return {
            tag: "list",
            value: result,
          };
        }
      } else {
        const mapping = new Map();
        Object.entries(val).forEach((obj) => {
          const attr = parseAttr(obj[1]);
          if (attr.tag !== "reject") {
            mapping.set(obj[0], attr);
          }
        });

        return {
          tag: "mapping",
          value: mapping,
        };
      }
    }
  }
};

const flattenEdges = function (branchset) {
  const parent = Number.parseInt(branchset.id, 10);
  const branches = branchset.branchset.map((child) => {
    return {
      from: parent,
      to: Number.parseInt(child.id),
      len: Number.parseFloat(child.branchLength),
    };
  });

  return branches.concat(branchset.branchset.flatMap(flattenEdges));
};
