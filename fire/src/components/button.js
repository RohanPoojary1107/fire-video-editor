import React from 'react';
class Button extends React.Component {    
    componentDidMount(){
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        document.addEventListener('drop', async (e) => {
            // Prevent navigation.
            e.preventDefault();
          
            // Process all items
            for (const item of e.dataTransfer.items) {
              if (item.kind === 'file') {
                const entry = await item.getAsFileSystemHandle();
                // console.log(entry.name) // currently just displaying dragged file name on console
                this.props.rtn(entry.name);
              }
            }
          });

        document.addEventListener('click', async () => {
        const Handle = await window.showOpenFilePicker({ multiple: true });
        for await (const entry of Handle.values()){
            // console.log(entry.kind, entry.name);
            this.props.rtn(entry.name);
            }
        });
    }

    render() {
        return(
            <button id={this.props.id}> 
            {this.props.value}
            </button>
        );
    }

}

export default Button;
