/**
 * This file is part of the vscode-toolbox distribution.
 * Copyright (c) Marcel Joachim Kloubert.
 *
 * vscode-toolbox is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation, version 3.
 *
 * vscode-toolbox is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import * as _ from 'lodash';
import * as vscode from 'vscode';

/**
 * Describes a simple 'completed' action.
 *
 * @param {any} err The occurred error.
 * @param {TResult} [result] The result.
 */
export type SimpleCompletedAction<TResult> = (err: any, result?: TResult) => void;

/**
 * Applies a function for a specific object / value.
 *
 * @param {TFunc} func The function.
 * @param {any} [thisArgs] The object to apply to the function.
 *
 * @return {TFunc} The wrapped function.
 */
export function applyFuncFor<TFunc extends Function = Function>(
    func: TFunc, thisArgs: any
): TFunc {
    return <any>function() {
        return func.apply(thisArgs, arguments);
    };
}

/**
 * Returns a value as array.
 *
 * @param {T|T[]} val The value.
 * @param {boolean} [removeEmpty] Remove items that are (null) / (undefined) or not.
 *
 * @return {T[]} The value as array.
 */
export function asArray<T>(val: T | T[], removeEmpty = true): T[] {
    removeEmpty = toBooleanSafe(removeEmpty, true);

    return (_.isArray(val) ? val : [ val ]).filter(i => {
        if (removeEmpty) {
            return !_.isNil(i);
        }

        return true;
    });
}

/**
 * Clones an object / value deep.
 *
 * @param {T} val The value / object to clone.
 *
 * @return {T} The cloned value / object.
 */
export function cloneObject<T>(val: T): T {
    if (!val) {
        return val;
    }

    return JSON.parse(
        JSON.stringify(val)
    );
}

/**
 * Compares two values for a sort operation.
 *
 * @param {T} x The left value.
 * @param {T} y The right value.
 *
 * @return {number} The "sort value".
 */
export function compareValues<T>(x: T, y: T): number {
    if (x !== y) {
        if (x > y) {
            return 1;
        } else if (x < y) {
            return -1;
        }
    }

    return 0;
}

/**
 * Compares values by using a selector.
 *
 * @param {T} x The left value.
 * @param {T} y The right value.
 * @param {Function} selector The selector.
 *
 * @return {number} The "sort value".
 */
export function compareValuesBy<T, U>(x: T, y: T,
                                      selector: (t: T) => U): number {
    return compareValues(selector(x),
                         selector(y));
}

/**
 * Creates a simple 'completed' callback for a promise.
 *
 * @param {Function} resolve The 'succeeded' callback.
 * @param {Function} reject The 'error' callback.
 *
 * @return {SimpleCompletedAction<TResult>} The created action.
 */
export function createCompletedAction<TResult = any>(resolve: (value?: TResult | PromiseLike<TResult>) => void,
                                                     reject?: (reason: any) => void): SimpleCompletedAction<TResult> {
    let completedInvoked = false;

    return (err, result?) => {
        if (completedInvoked) {
            return;
        }
        completedInvoked = true;

        if (err) {
            if (reject) {
                reject(err);
            }
        } else {
            if (resolve) {
                resolve(result);
            }
        }
    };
}

/**
 * Returns a value as boolean, which is not (null) and (undefined).
 *
 * @param {any} val The value to convert.
 * @param {boolean} [defaultVal] The custom default value if 'val' is (null) or (undefined).
 *
 * @return {boolean} 'val' as boolean.
 */
export function toBooleanSafe(val: any, defaultVal = false): boolean {
    if (_.isBoolean(val)) {
        return val;
    }

    if (_.isNil(val)) {
        return !!defaultVal;
    }

    return !!val;
}

/**
 * Returns a value as string, which is not (null) and (undefined).
 *
 * @param {any} val The value to convert.
 * @param {string} [defaultVal] The custom default value if 'val' is (null) or (undefined).
 *
 * @return {string} 'val' as string.
 */
export function toStringSafe(val: any, defaultVal = ''): string {
    if (_.isString(val)) {
        return val;
    }

    if (_.isNil(val)) {
        return '' + defaultVal;
    }

    try {
        if (val instanceof Error) {
            return '' + val.message;
        }

        if (_.isFunction(val['toString'])) {
            return '' + val.toString();
        }

        if (_.isObject(val)) {
            return JSON.stringify(val);
        }
    } catch { }

    return '' + val;
}