import dataPrep from './custom/dataPrep';

export default function onInit() {
    var context = this;
    if (!Array.isArray(this.config.statuses) || this.config.statuses.length === 0)
        this.config.statuses = d3.set(
            this.raw_data
                .map(d => d[this.config.status_var]))
            .values()
            .sort();
    dataPrep(context);
}
