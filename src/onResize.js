export default function onResize() {
    var context = this;
  //Add x/y values of mouseover.
    var timeFormat = d3.time.format('%d %b %Y');
    var width = this.plot_width;
    var x = this.x;
    var y = this.y;
    var decim = d3.format('.0f');

    var x_mark = this.svg.select('.x.axis')
        .append('g')
        .attr('class', 'hover-item hover-tick hover-tick-x')
        .style('display', 'none');
    x_mark.append('line')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', 0)
        .attr('y2', 0)
        .attr('stroke', '#ddd');
    x_mark.append('text')
        .attr({'id': 'dateText', 'x': 0, 'y': -this.plot_height, 'dx': '.5em', 'dy': '.5em'});
    x_mark.append('text')
        .attr({'id': 'countText', 'x': 0, 'y': -this.plot_height, 'dx': '.5em', 'dy': '.5em'});
    x_mark.select('line')
        .attr('y1', -this.plot_height);

    //var frequencyType = d3.selectAll('.control-group')
    //    .filter(function() {
    //        return d3.select(this).select('.control-label').text() === 'Frequency Type'; })
    //    .selectAll('option')
    //    .filter(function() {
    //        return d3.select(this).property('selected'); })
    //    .property('value');

    this.svg
        .on('mousemove', mousemove)
        .on('mouseover', function() {
            context.svg.selectAll('.hover-item')
                .style('display', 'block');
            var leg_items = context.wrap.select('.legend')
                .selectAll('.legend-item');
            leg_items.select('.legend-color-block')
                .style('display', 'none');
            leg_items.select('.legend-mark-text')
                .style('display', 'inline');
        })
        .on('mouseout', function() {
            context.svg.selectAll('.hover-item')
                .style('display', 'none');
            var leg_items = context.legend.selectAll('.legend-item');
            leg_items.select('.legend-color-block')
                .style('display', 'inline-block');
            leg_items.select('.legend-mark-text')
                .style('display', 'none');
        });

    function mousemove() {
        var mouse = this;

        context.current_data
            .forEach(function(e) {
                var line_data = e.values;
                var bisectDate = d3.bisector(function(d) {
                    return new Date(d.key);
                }).right;
                var x0 = x.invert(d3.mouse(mouse)[0]);
                var i = bisectDate(line_data, x0, 1, line_data.length-1);
                var d0 = line_data[i - 1];
                var d1 = line_data[i];

                if(!d0 || !d1) return;

                var d = x0 - new Date(d0.key) > new Date(d1.key) - x0 ? d1 : d0;
                var hover_tick_x = context.svg.select(".hover-tick-x");
                var focus_enr = context.svg.selectAll(".focus")
                    .filter(function(f) {
                        return f.key === e.key;
                    });

                hover_tick_x.select("#dateText")
                    .text(timeFormat(x0))
                    .attr("text-anchor", x(x0) > width/2 ? "end" : "start")
                    .attr("dx", x(x0) > width/2 ? "-.5em" : ".5em");

                var leg_item = context.wrap.select(".legend")
                    .selectAll(".legend-item")
                    .filter(function(f){
                        return f.label === e.key
                    });

                var currentYear = x0.getYear() + 1900;
                var currentMonth = x0.getMonth();
                var currentDay = x0.getDate()
                var nextMonth = new Date(currentYear, currentMonth + 1, 1);
                nextMonth.setDate(nextMonth.getDate() - 1);
                var daysInCurrentMonth = nextMonth.getDate();

                var firstOfTheMonth = timeFormat(new Date
                    (currentYear
                    ,x0.getMonth() + ((currentDay > Math.round(daysInCurrentMonth/2)) ? 1 : 0)
                    ,1));
                var lineDate = timeFormat(d.values.raw[0].date);
                leg_item.select(".legend-mark-text")
                    .text(
                        (d.values.raw[0].count || d.values.raw[0].count === 0) && lineDate === firstOfTheMonth ?
                            decim(d.values.raw[0].count) :
                        lineDate !== firstOfTheMonth ? 0 : null);
                hover_tick_x
                    .attr("transform", "translate("+x(x0)+",0)");  //move tick reference on x-axis
                var total = d3.sum
                    (d3.selectAll('.legend-mark-text').pop()
                    ,function(span) {
                        return +span.textContent; });
                hover_tick_x.select("#countText")
                    .text(total)
                    .attr("text-anchor", x(x0) > width/2 ? "start" : "end")
                    .attr("dx", x(x0) > width/2 ? ".5em" : "-.5em");

        });
    };
}
