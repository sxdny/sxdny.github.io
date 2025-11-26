---
layout: ../../layouts/post.astro
title: "churn rate with SQL."
description: "Calculating the user's churn rate from a website with SQL."
date: '25-11-2025'
---

It's been a nearly two month ever since I started doing the Data Engineer course from Codecademy.

Yesterday, I was doing some project that requires a little bit of explanation and instead of creating a PowerPoint slide, I thought about publishing it in my blog and explain the thought process behind all the queries and all of that. I'll be answering a couple of questions that the exercise provided as well.

So, yeah. Let's go.

<br>

---

<br>
<br>

# What is churn rate?

A churn rate is the percent of subscribers that have canceled his subscription on a service / app within a certain period of time, usually a month. In order for a user base to grow, the churn rate must be less than the new subscriber rate for the same period.

To calculate the churn rate, we only will be considering users who are subscribed at the **beginning of the month.**

The churn rate is the number of these users who cancel during the month divided by the total number. We can get it with the following formula:

<br>

$$
\huge \text{churn rate} =  \frac{\text{cancellations}}{\text{total subscribers}}
$$

<br>
    
For example, we want to get the churn rate for a video streaming service (Netflix f.e) for the month of February. Knowing that we have $1000$ customer at the beginning of that month and $250$ of these, canceled his subscription, the churn rate would be the following:

<br>

$$
\huge 250 \div 1000 = 25\% \text{ churn rate}
$$

<br>
<br>

---

<br>
<br>

# Imaginary company information

We have a company called CodeFlix, a streaming video startup, that is interested in measuring their user churn rate.

We created a database for this company. Inside, we have a table called `subscriptions`. Within the table, there are 4 columns:

- `id`. the subscription's id.
- `segment`.this identifies which segment the subscription owner belongs to.
- `subscription_start`. the start date of the subscription.
- `subscription_end`. the cancel date of the subscription. if the value is `null`, it means that the subscription hasn't been canceled (yet).

CodeFlix requires a minimun subscription length of 31 days, meaning that a user can never start and end their subscription in the same month.

Let's have a look inside this table:

```sql
SELECT * FROM subscriptions;
```

Output:

| id  | subscription_start | subscription_end | segment |
| --- | ------------------ | ---------------- | ------- |
| 1   | 2016-12-01         | 2017-02-01       | 87      |
| 2   | 2016-12-01         | 2017-01-24       | 87      |
| 3   | 2016-12-01         | 2017-03-07       | 87      |
| 4   | 2016-12-01         | 2017-02-12       | 87      |
| 5   | 2016-12-01         | 2017-03-09       | 87      |
| 6   | 2016-12-01         | 2017-01-19       | 87      |


<br>
<br>

---

<br>
<br>
    
## Determining the range of months that the company has been active

Because we have the starting and ending date for each subscription, we can select the month from the starting date with the following statement:

```sql
SELECT DISTINCT strftime('%m', subscription_start) AS month
FROM subscriptions;
```

What this does, first, is to get all the "month" numbers from all the dates with the help of the `strftime()` function. Within this function, I'm passing as a parameter `%m` because I just want the month and the actual date that we are getting the month number, in this case is `subscription_start`.

Later doing this exercise, I noticed that I also needed the year from the dates. To get that, we can use the same `strftime()` function, but instead of passing `%m` we need to pass `%Y`.

Now, with these statements, I can create a temporary table called `operative_months`. I will be using it later:

```sql
WITH operative_months AS (
  SELECT DISTINCT strftime('%m', subscription_start) AS month,
  strftime('%Y', subscription_start) AS year
  FROM subscriptions
)
```

With this table, we will get a table with the following data:

|month | year |
|-----|------|
|12|2016|
|01|2017|
|02|2017|
|03|2017|

Once we have this table created, we can create a `months` table, containing the first and last day for each month listed before. This way, we can compare the dates more easily later.

We can create this table using the following statement:

```sql
months AS (
  SELECT
  date(year || '-' || month || '-01') AS first_day,
  date(year || '-' || month || '-01', '+1 month', '-1 day') AS last_day
  FROM operative_months
)
```

Here I'm creating the `first_day` column concatenaiting the `year`, the `month` and `-01`, because it's the first day of course. Then, for the `last_day` column, i'm just getting the first day of the month, then I add one month and then, I substract one day. I found this solution on the Internet, so thanks guy of the Internet!

<br>
<br>

---

<br>
<br>
    
## Comparing values

Now that we have the `months` table created, we can use it to compare the values from the `subscriptions` table.

We can perform a CROSS JOIN, because CROSS JOIN is useful for comparing values.

Once again, we create a temporary table called `cross_join` with the following statement:

```sql
cross_join AS (
	SELECT * FROM subscriptions
	CROSS JOIN months
)
```

**Note:** When creating this temporary tables, I'm not using `WITH`. This is because I'm putting it all together, so I can omit the use of `WITH`:

```sql
WITH x AS (
  -- ...
),
y AS (
 -- ...
)
```

The next step is to obtain the status for each subscription for each month. Guess what, we can create another temporary table called `status` that will include the following columns:

- `id`. the subscription's id.
- `month`. the current month of the subscription status.
- `segment`. the segment which it belongs the subscription.
- `is_active`. a boolean value indicating if the subscription is active (`1`) or not (`0`) that month.
- `is_canceled`. boolean value indicating if the subscription is canceled or not.

We can create this temporary table with the following statement:

```sql
status AS (
  SELECT id,
  first_day AS month,
  segment,
  CASE
	  WHEN (subscription_start < first_day)
	    AND (
		    (subscription_end > first_day)
		    OR (subscription_end IS NULL)
	    ) THEN 1
	  ELSE 0
  END AS is_active,
  CASE
	  WHEN subscription_end BETWEEN first_day AND last_day THEN 1
	  ELSE 0
  END AS is_canceled
  FROM cross_join
)
```

Notice that inside this query we have two `CASE` for creating columns. The first one being the `is_active` column:

```sql
CASE
  WHEN (subscription_start < first_day)
    AND (
      (subscription_end > first_day)
      OR (subscription_end IS NULL)
    ) THEN 1
  ELSE 0
END AS is_active
```

In this `CASE` statement, we want the `subscription_start` date to be less than the `first_day` of the month and the `subscription_end` date to be after `first_day` or when the `subscription_end` value is `NULL`. I'm doing it this way because I only want those subscriptions that are entering $x$ month as active and they're not canceled or the cancel date is after the first day, I don't care if they canceled later that month, they're entering that month as active.

And the second one being the `is_canceled`:

```sql
CASE
  WHEN subscription_end BETWEEN first_day AND last_day THEN 1
  ELSE 0
END AS is_canceled
FROM cross_join
```

Here, I'm counting as canceled the subscriptions where the `subscription_end` date is between the first and last day of the month. The limits are inclusive, so if a user cancelled his subscription the first day of the month, is entering that month as cancelled. That's why, in the `is_active` column, I want the ones which `subscription_start` date is before the first day.

<br>
<br>

---

<br>
<br>

# Calculating the results

Now that we have all this information sorted, the last step is just to apply the formula that I explained before.

First, we need to get the total of users who's subscription is active and the total for the canceled ones. In this case, I created two temporary tables for each segment.

The exercise told me to create a same temporary table and store both of the segments, creating columns for each one of them, but instead, I just created two temporary tables:

```sql
status_aggregate_87 AS (
	SELECT month,
		SUM(is_active) AS active,
		SUM(is_canceled) AS canceled
	FROM status
  WHERE segment = '87'
	GROUP BY month
),
status_aggregate_30 AS (
	SELECT month,
		SUM(is_active) AS active,
		SUM(is_canceled) AS canceled
	FROM status
  WHERE segment = '30'
	GROUP BY month
)
```

Finally, we can calculate the churn rate for each segment. I created one more temporary table for it:

```sql
churn_rate AS (
  SELECT month,
        segment,
        1.0 * active / canceled AS churn_rate
  FROM status_aggregate_87
  WHERE month != '2016-12-01'
  UNION
  SELECT month,
        segment,
        1.0 * active / canceled AS churn_rate
  FROM status_aggregate_30
  WHERE month != '2016-12-01'
  ORDER BY segment
)
SELECT * FROM churn_rate;
```

Notice that I'm multiplying by $1$. If I don't do it this way, the result would be rounded and innaccurate. By multiplying it by one, I avoid this behaviour.

Also, I'm aplying a filter: I don't want the December results. This is simply because we don't have data for that month, so I don't want to show it.

Output:


| month      | segment | churn_rate       |
| ---------- | ------- | ---------------- |
| 2017-01-01 | 30      | 13.2272727272727 |
| 2017-02-01 | 30      | 13.6315789473684 |
| 2017-03-01 | 30      | 8.52380952380952 |
| 2017-01-01 | 87      | 3.97142857142857 |
| 2017-02-01 | 87      | 3.12162162162162 |
| 2017-03-01 | 87      | 2.05813953488372 |

Here we can see that the churn rate is higher in the 30 segment than the 87 one. The good thing is that for both segment, the churn rates lowered throught the pass of the months.

**What if we want to calculate the overall churn rate?** In order to get it, instead of creating a `status_aggregate_x` for each segment, we just sum the total between the two and we perform the calculations. The result that we would get is the following:

| month |	churn_rate |
|-------|------------|
|2017-01-01 |	6.18478260869565 |
|2017-02-01 |	5.26881720430108 |
|2017-03-01 |	3.64619883040936 |

<br>
<br>

---

<br>
<br>
    
# Conclusion

 I learned a lot doing this single project: some SQL functions, behaviours and how I can use the language to get important information for companies.

I hope my explanation was good enough. Thank you.

<3
