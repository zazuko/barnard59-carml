# barnard59-carml

This package wraps the [carml-cli](https://github.com/netage/carml-cli) tool into a barnard59 Linked Data pipeline operation.

**This package requires a Java Runtime Environment**

## Operations

### transform ({ mapping, mappingFile })

The operation uses the given `mapping` or `mappingFile` to transform the incoming data.
It returns a `Readable` stream of RDF/JS `Quad` objects.

- `mapping`: A `String`, `Buffer`, `Uint8Array`, or `Readable` stream that contains the RML mapping.
- `mappingFile`: A `String` that contains the path to the RML mapping file.
