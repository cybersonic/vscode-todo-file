import * as assert from 'assert';
import {expect, jest, test} from '@jest/globals';


// You can import and use all API from the 'vscode' module
// as well as import your extension to test it


// import * as myExtension from '../../extension';
import { parseTodoText, TodoItem} from '../parser';

describe('Parser Test', () => {
    

        it('Parse Todo File', () => {
            const result = parseTodoText(
                `## 2023-10-01
                - [ ] Todo 1
                - [x] Done 1
                ## 2023-10-02`);


            console.log(result);
    
            expect(result.length).toBe(2);
            expect(result[0].date).toBe('2023-10-01');
            expect(result[0].lines.length).toBe(3);
            

    });

});
