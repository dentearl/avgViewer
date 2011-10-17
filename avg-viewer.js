// Compute the distinct nodes from the links.
links.forEach(function(link) {
  link.source = nodes[link.source];
  link.target = nodes[link.target];
});

var w = 1200,
    h = 600,
    r = 6,
    segLinkDist = 1,
    adjLinkDist = 1,
    desLinkDist = 200,
    segLinkStren = 1.0,
    adjLinkStren = 1.0,
    desLinkStren = 1.0;


// three foci per level    
var foci = [{x: 30, y:  50}, {x: w / 2, y: 25}, {x: w - 30, y:  50},
            {x: 30, y: h - 50}, {x: w / 2, y: h - 25}, {x: w - 30, y: h - 50}];

var levels = [{y: 50}, {y: h - 50}];

// pin the edge nodes and fix them
d3.values(nodes).forEach(function(node) {
    if (node.end){
        node.x = foci[node.focus].x;
        node.y = foci[node.focus].y;
        node.fixed = true;
    };
});

var force = d3.layout.force()
    .nodes(d3.values(nodes))
    .links(links)
    .size([w, h])
    .linkDistance(findLinkDistance)
    .gravity(0.1)
    .charge(findCharge)
    .linkStrength(findLinkStrength)
    .on("tick", tick)
    .start();

force.on("tick", function(e){
    // Move nodes to top or bottom depending on focus
    var k = 0.4 * e.alpha;
    d3.values(nodes).forEach(function(o, i){
        if (o.end == true) { k = 2.0 * e.alpha; }else{k = 0.01 * e.alpha; }
        o.y += (foci[o.focus].y - o.y) * k;
        o.x += (foci[o.focus].x - o.x) * k;
        o.y += (levels[o.level].y - o.y) * 0.001;
        // Bounding box
        o.y = Math.max(r, Math.min(h - r, o.y));
        o.x = Math.max(r, Math.min(w - r, o.x));
    });
});

var svg = d3.select("body").append("svg:svg")
    .attr("width", w)
    .attr("height", h);

// Per-type markers, as they don't inherit styles.
svg.append("svg:defs").selectAll("marker")
    .data(["descent", "segment", "adjacency"])
  .enter().append("svg:marker")
    .attr("id", String)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 15)
    .attr("refY", -1.5)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .attr("fill", "red")
  .append("svg:path")
    .attr("d", "M0,-5L10,0L0,5");

var link = svg.selectAll("link.link")
        .data(links)
     .enter().append("svg:line")
        .attr("class", function(d) { return "link " + d.type; })
        .attr("marker-end", function(d) { if (d.type == 'descent') return "url(#" + d.type + ")"; })
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; })
    .attr("id", function(d) { return d.id; });
//        .on("dblclick", dblClickLink);

var circle = svg.append("svg:g").selectAll("circle")
        .data(force.nodes())
      .enter().append("svg:circle")
        .attr("class", function(d) { if (d.level == "0"){return "genome a"}else{return "genome b"}})
        .attr("r", function(d) { if (d.end){return r * 1.5}else{return r - 0.75}})
        .call(force.drag);

var text = svg.append("svg:g").selectAll("g")
    .data(force.nodes())
  .enter().append("svg:g");

// A copy of the text with a thick white stroke for legibility.
text.append("svg:text")
    .attr("x", 8)
    .attr("y", ".31em")
    .attr("class", "shadow")
    .text(function(d) { return d.name; });
text.append("svg:text")
    .attr("x", 8)
    .attr("y", ".31em")
    .text(function(d) { return d.name; });

// different charges between nodes of certain types -- not currently implemented
function findCharge(n, i){
    return -200
}

// different linkDistances between nodes of certain types
function findLinkDistance(l, i){
    if (l.type == "descent"){return desLinkDist};
    if (l.type == "adjacency"){return adjLinkDist};
    if (l.type == "segment"){return segLinkDist};
}

function findLinkStrength(l, i){
    if (l.type == "descent"){return desLinkStren};
    if (l.type == "adjacency"){return adjLinkStren};
    if (l.type == "segment"){return segLinkStren};
}

function tick() {
  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  circle.attr("transform", function(d) {
    return "translate(" + d.x + "," + d.y + ")";
  });

  text.attr("transform", function(d) {
    return "translate(" + d.x + "," + d.y + ")";
  });
}

function dblClickLink(l){
    alert("you double clicked link id " + l.id + " from " + l.source.name + " to " + l.target.name);
    //links.splice(links.indexOf(l), 1);
    //update();
}

function update(){
    alert('updating');
    force
      .nodes(nodes)
      .links(links)
      .start();
  // Update the links.
  link = svg.selectAll("line")
      .data(links, function(d) { return d.target.name; });

  link.enter().insert("svg:line", ".node")
      .attr("class", "link");
  link.exit().remove();

  // Update the nodes.
  node.exit().remove();
  node = svg.selectAll("circle")
      .data(nodes, function(d) { return d.name; });
  
  node.enter().append("svg:circle")
      .attr("class", "node")
      .attr("class", function(d) { if (d.level == "0"){return "genome a"}else{return "genome b"}})
      .attr("r", function(d) { if (d.end){return r * 1.5}else{return r - 0.75}})
      .call(force.drag);

  
}
